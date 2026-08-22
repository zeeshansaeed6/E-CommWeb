import Product from '../models/Product.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

// @desc    Fetch all products with advanced filtering, search & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const queryFilter = { isActive: true };

    // Keyword Search
    if (req.query.keyword) {
      queryFilter.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { brand: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }

    // Category Filter
    if (req.query.category && req.query.category !== 'All') {
      queryFilter.category = req.query.category;
    }

    // Vendor Filter
    if (req.query.vendor) {
      queryFilter.vendor = req.query.vendor;
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryFilter.price = {};
      if (req.query.minPrice) queryFilter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryFilter.price.$lte = Number(req.query.maxPrice);
    }

    // Rating Filter
    if (req.query.rating) {
      queryFilter.rating = { $gte: Number(req.query.rating) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (req.query.sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (req.query.sort === 'rating') {
      sortOptions = { rating: -1 };
    }

    const count = await Product.countDocuments(queryFilter);
    const products = await Product.find(queryFilter)
      .populate('vendor', 'name email vendorDetails avatar')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch top featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('vendor', 'name vendorDetails avatar')
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email phone avatar vendorDetails')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Vendor/Admin)
// @route   POST /api/products
// @access  Private (Vendor, Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      tags,
      isFeatured,
    } = req.body;

    if (!title || !description || price === undefined || !category) {
      res.status(400);
      throw new Error('Please provide title, description, price, and category');
    }

    const defaultImages = images && images.length > 0
      ? images
      : [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', public_id: '' }];

    const product = await Product.create({
      vendor: req.user._id,
      title,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      brand: brand || 'Generic',
      stock: Number(stock) || 0,
      images: defaultImages,
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Owner Vendor or Admin)
// @route   PUT /api/products/:id
// @access  Private (Vendor, Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ownership Authorization Check
    const isOwner = product.vendor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update this product. You do not own it.');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('vendor', 'name vendorDetails');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Owner Vendor or Admin)
// @route   DELETE /api/products/:id
// @access  Private (Vendor, Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const isOwner = product.vendor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product image(s) to Cloudinary
// @route   POST /api/products/upload
// @access  Private (Vendor, Admin)
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // Check single file
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        return res.json({ success: true, image: result });
      }
      res.status(400);
      throw new Error('No image file provided');
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      images: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product review & update average rating
// @route   POST /api/products/:id/reviews
// @access  Private (Customer, Admin, Vendor)
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};
