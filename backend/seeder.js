import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

const importData = async () => {
  try {
    // Clear existing collections
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Cleared old collections...');

    // 1. Create Users (Admin, 2 Vendors, Customer)
    const users = await User.create([
      {
        name: 'Platform Admin',
        email: 'admin@ecommerce.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'TechGear Official',
        email: 'techgear@vendor.com',
        password: 'password123',
        role: 'Vendor',
        vendorDetails: {
          storeName: 'TechGear Prime',
          storeDescription: 'Premier flagship audio gear, high performance laptops & next-gen accessories.',
          storeLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          commissionRate: 10,
          isApproved: true,
        },
      },
      {
        name: 'UrbanStyle Apparel',
        email: 'urbanstyle@vendor.com',
        password: 'password123',
        role: 'Vendor',
        vendorDetails: {
          storeName: 'UrbanStyle Boutique',
          storeDescription: 'Contemporary streetwear, premium fabrics, and curated minimalist fashion.',
          storeLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
          commissionRate: 12,
          isApproved: true,
        },
      },
      {
        name: 'Sarah Customer',
        email: 'sarah@customer.com',
        password: 'password123',
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        address: {
          street: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'United States',
        },
      },
    ]);

    const vendor1 = users[1]._id;
    const vendor2 = users[2]._id;
    const customer = users[3]._id;

    console.log('[Seeder] Users seeded successfully.');

    // 2. Create Products
    const products = [
      {
        vendor: vendor1,
        title: 'AeroPulse Wireless Noise-Cancelling Headphones',
        description: 'Engineered with 40mm titanium drivers and active acoustic cancellation. Delivers up to 45 hours of ultra-low distortion audio with fast USB-C charge.',
        price: 249.99,
        discountPrice: 199.99,
        category: 'Electronics',
        brand: 'AeroSound',
        stock: 35,
        rating: 4.8,
        numReviews: 24,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80' },
        ],
        tags: ['audio', 'wireless', 'bluetooth', 'anc'],
      },
      {
        vendor: vendor1,
        title: 'ProVision 4K Ultra-Thin Monitor 27"',
        description: 'Stunning IPS panel with 99% sRGB color accuracy, 144Hz refresh rate, HDR400, and integrated 65W Power Delivery over USB-C.',
        price: 429.99,
        discountPrice: 389.99,
        category: 'Electronics',
        brand: 'ProVision',
        stock: 18,
        rating: 4.9,
        numReviews: 42,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=1400&q=80' },
        ],
        tags: ['monitor', '4k', 'display', 'gaming'],
      },
      {
        vendor: vendor1,
        title: 'NovaKey Mechanical Keyboard RGB',
        description: 'Aircraft-grade anodized aluminum frame with hot-swappable tactile switches and per-key RGB backlighting.',
        price: 129.99,
        discountPrice: 0,
        category: 'Electronics',
        brand: 'NovaKey',
        stock: 50,
        rating: 4.6,
        numReviews: 19,
        isFeatured: false,
        images: [
          { url: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?auto=format&fit=crop&w=1400&q=80' },
          { url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1400&q=80' },
        ],
        tags: ['keyboard', 'rgb', 'gaming'],
      },
      {
        vendor: vendor2,
        title: 'Minimalist Oxford Cotton Overshirt',
        description: 'Woven from 100% organic heavyweight cotton. Tailored relaxed fit with horn buttons and utility chest pockets.',
        price: 89.99,
        discountPrice: 69.99,
        category: 'Fashion & Apparel',
        brand: 'UrbanStyle',
        stock: 40,
        rating: 4.7,
        numReviews: 31,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' },
          { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' },
        ],
        tags: ['shirt', 'cotton', 'minimalist', 'outerwear'],
      },
      {
        vendor: vendor2,
        title: 'Artisan Full-Grain Leather Weekender Bag',
        description: 'Handcrafted vegetable-tanned leather featuring brass hardware, reinforced straps, and a dedicated padded shoe compartment.',
        price: 199.99,
        discountPrice: 179.99,
        category: 'Fashion & Apparel',
        brand: 'UrbanStyle Heritage',
        stock: 22,
        rating: 4.9,
        numReviews: 15,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
        ],
        tags: ['leather', 'bag', 'travel', 'duffel'],
      },
      {
        vendor: vendor2,
        title: 'Thermal Insulated Stainless Steel Coffee Tumbler',
        description: 'Double-wall vacuum insulation keeps liquids piping hot for 12 hours or ice cold for 24 hours. Leakproof lid with ceramic interior coating.',
        price: 34.99,
        discountPrice: 29.99,
        category: 'Home & Kitchen',
        brand: 'HydroLife',
        stock: 120,
        rating: 4.8,
        numReviews: 53,
        isFeatured: false,
        images: [
          { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
        ],
        tags: ['tumbler', 'coffee', 'kitchen', 'eco'],
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`[Seeder] Seeded ${createdProducts.length} products.`);

    // 3. Create Sample Multi-Vendor Order
    const p1 = createdProducts[0]; // Vendor 1 ($199.99)
    const p4 = createdProducts[3]; // Vendor 2 ($69.99)

    const itemsPrice = p1.discountPrice * 1 + p4.discountPrice * 2; // 199.99 + 139.98 = 339.97
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const shippingPrice = 0.0;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    const sampleOrder = await Order.create({
      customer,
      orderItems: [
        {
          product: p1._id,
          title: p1.title,
          qty: 1,
          price: p1.discountPrice,
          image: p1.images[0].url,
          vendor: vendor1,
          fulfillmentStatus: 'Shipped',
          trackingNumber: 'TRK-USPS-8849201',
          carrier: 'USPS Priority',
          shippedAt: new Date(),
        },
        {
          product: p4._id,
          title: p4.title,
          qty: 2,
          price: p4.discountPrice,
          image: p4.images[0].url,
          vendor: vendor2,
          fulfillmentStatus: 'Processing',
        },
      ],
      vendorPayouts: [
        {
          vendor: vendor1,
          grossAmount: 199.99,
          commissionRate: 10,
          platformFee: 20.0,
          netPayout: 179.99,
          payoutStatus: 'Pending',
        },
        {
          vendor: vendor2,
          grossAmount: 139.98,
          commissionRate: 12,
          platformFee: 16.8,
          netPayout: 123.18,
          payoutStatus: 'Pending',
        },
      ],
      shippingAddress: {
        street: '742 Evergreen Terrace',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
      },
      paymentMethod: 'Stripe',
      paymentResult: {
        id: 'pi_demo_seed_sample_3984',
        status: 'paid',
        update_time: new Date().toISOString(),
        email_address: 'sarah@customer.com',
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      stripeSessionId: 'cs_test_sample_session',
      overallFulfillmentStatus: 'Partially Fulfilled',
    });

    console.log(`[Seeder] Sample split order seeded: ${sampleOrder._id}`);
    console.log('\n--- SEED DATA CREDENTIALS ---');
    console.log('Admin:    admin@ecommerce.com / password123');
    console.log('Vendor 1: techgear@vendor.com / password123');
    console.log('Vendor 2: urbanstyle@vendor.com / password123');
    console.log('Customer: sarah@customer.com / password123');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

importData();
