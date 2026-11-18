// Adds new demo products WITHOUT clearing existing data (unlike seeder.js).
// Safe to re-run: products are matched by title and skipped if they already exist.
// Usage: node addProducts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

const img = (id) => ({ url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80` });

const findOrCreateVendor = async (email, data) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ email, password: 'password123', role: 'Vendor', ...data });
};

try {
  const tech = await User.findOne({ email: 'techgear@vendor.com' });
  const urban = await User.findOne({ email: 'urbanstyle@vendor.com' });
  if (!tech || !urban) throw new Error('Run the seeder once first: demo vendors not found.');

  const heritage = await findOrCreateVendor('heritage@vendor.com', {
    name: 'Heritage Timepieces',
    vendorDetails: {
      storeName: 'Heritage Timepieces',
      storeDescription: 'Authenticated luxury watches, insured worldwide delivery and a full guarantee on every piece.',
      storeLogo: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=200&q=80',
      commissionRate: 10,
      isApproved: true,
    },
  });

  const products = [
    {
      vendor: heritage._id,
      title: 'Rolex Yacht-Master 42',
      description:
        'A sports watch made for open water. A bidirectional rotatable bezel, a 42 mm Oyster-style case and 100 metres of water resistance meet a self-winding movement with roughly 70 hours of reserve. Delivered with its certificate of authenticity, insured and signed for.',
      price: 14500,
      discountPrice: 0,
      category: 'Watches & Jewelry',
      brand: 'Rolex',
      stock: 3,
      rating: 4.9,
      numReviews: 18,
      isFeatured: true,
      theme: 'luxury',
      images: [img('1587836374828-4dbafa94cf0e'), img('1547996160-81dfa63595aa')],
      tags: ['watch', 'luxury', 'automatic', 'diver'],
      specs: [
        { group: 'Case', label: 'Diameter', value: '42 mm' },
        { group: 'Case', label: 'Style', value: 'Oyster-style, screw-down crown' },
        { group: 'Case', label: 'Bezel', value: 'Bidirectional rotatable' },
        { group: 'Case', label: 'Crystal', value: 'Scratch-resistant sapphire' },
        { group: 'Case', label: 'Water resistance', value: '100 metres / 330 feet' },
        { group: 'Dial', label: 'Display', value: 'Hours, minutes, seconds, date' },
        { group: 'Dial', label: 'Luminescence', value: 'Long-lasting glow on hands and markers' },
        { group: 'Movement', label: 'Type', value: 'Self-winding mechanical' },
        { group: 'Movement', label: 'Power reserve', value: 'Approx. 70 hours' },
        { group: 'Movement', label: 'Accuracy', value: 'Certified chronometer-grade' },
        { group: 'Bracelet', label: 'Type', value: 'Integrated strap with folding clasp' },
        { group: 'Bracelet', label: 'Extension', value: 'Tool-free fine adjustment' },
        { group: 'Included', label: 'Box set', value: 'Presentation case, certificate, guarantee card' },
      ],
    },
    {
      vendor: heritage._id,
      title: 'Minimal Rose Dial Quartz Watch',
      description: 'A slim 36 mm case, soft taupe leather strap and a quiet rose-gold finish. Japanese quartz movement, sapphire-coated glass and 50 metres of water resistance.',
      price: 189, discountPrice: 159, category: 'Watches & Jewelry', brand: 'Linea', stock: 24, rating: 4.6, numReviews: 41,
      images: [img('1524592094714-0f0654e20314')], tags: ['watch', 'minimal'],
    },
    {
      vendor: urban._id,
      title: 'AirFlow Runner Performance Sneakers',
      description: 'Breathable engineered mesh, a responsive foam midsole and a grippy outsole built for daily miles. Lightweight enough to forget you are wearing them.',
      price: 129, discountPrice: 99, category: 'Fashion & Apparel', brand: 'AirFlow', stock: 60, rating: 4.7, numReviews: 88, isFeatured: true,
      images: [img('1542291026-7eec264c27ff')], tags: ['shoes', 'running'],
    },
    {
      vendor: urban._id,
      title: 'Aviator Polarized Sunglasses',
      description: 'Lightweight metal frame with polarized, UV400 lenses that cut glare on water and road. Comes with a hard case and cleaning cloth.',
      price: 89, discountPrice: 0, category: 'Fashion & Apparel', brand: 'Solace', stock: 45, rating: 4.5, numReviews: 63,
      images: [img('1572635196237-14b3f281503f')], tags: ['eyewear', 'summer'],
    },
    {
      vendor: urban._id,
      title: 'Noir Essence Eau de Parfum 100ml',
      description: 'Smoked amber, black pepper and warm cedar settle into a soft musk. A long-lasting evening fragrance in a weighted glass bottle.',
      price: 120, discountPrice: 96, category: 'Beauty & Health', brand: 'Maison Noir', stock: 30, rating: 4.8, numReviews: 52, isFeatured: true,
      images: [img('1541643600914-78b084683601')], tags: ['fragrance', 'gift'],
    },
    {
      vendor: urban._id,
      title: 'Barista Pro Espresso Machine',
      description: '15-bar pump, a steam wand for silky microfoam and a fast-heat boiler that is ready in under 30 seconds. Brushed stainless steel finish.',
      price: 349, discountPrice: 299, category: 'Home & Kitchen', brand: 'Brewlab', stock: 14, rating: 4.7, numReviews: 37,
      images: [img('1517668808822-9ebb02f2a0e6')], tags: ['coffee', 'kitchen'],
    },
    {
      vendor: urban._id,
      title: 'Halo Desk Lamp',
      description: 'A dimmable LED lamp with three colour temperatures and a flexible arm. Eye-friendly light for long working sessions.',
      price: 79, discountPrice: 0, category: 'Home & Kitchen', brand: 'Halo', stock: 52, rating: 4.4, numReviews: 29,
      images: [img('1507473885765-e6ed057f782c')], tags: ['lighting', 'office'],
    },
    {
      vendor: urban._id,
      title: 'Alpine Trek 40L Backpack',
      description: 'Weather-resistant ripstop fabric, a padded ventilated back panel and a rain cover. Space for three days on the trail.',
      price: 119, discountPrice: 94, category: 'Sports & Outdoors', brand: 'Alpine', stock: 38, rating: 4.6, numReviews: 74,
      images: [img('1553062407-98eeb64c6a62')], tags: ['hiking', 'travel'],
    },
    {
      vendor: urban._id,
      title: 'Zen Grip Yoga Mat',
      description: 'A 6 mm natural-rubber mat with a non-slip surface that grips even when you sweat. Includes a carry strap.',
      price: 59, discountPrice: 0, category: 'Sports & Outdoors', brand: 'Zen', stock: 70, rating: 4.5, numReviews: 96,
      images: [img('1601925260368-ae2f83cf8b7f')], tags: ['yoga', 'fitness'],
    },
    {
      vendor: tech._id,
      title: 'Lumina X5 Mirrorless Camera',
      description: 'A 24 MP sensor, fast hybrid autofocus and 4K video in a compact body. Weather-sealed and ready for travel.',
      price: 899, discountPrice: 829, category: 'Electronics', brand: 'Lumina', stock: 9, rating: 4.8, numReviews: 33, isFeatured: true,
      images: [img('1516035069371-29a1b244cc32')], tags: ['camera', 'photography'],
    },
    {
      vendor: tech._id,
      title: 'Atelier Leather Journal',
      description: 'Hand-stitched full-grain leather cover with 240 pages of acid-free cream paper and a ribbon marker.',
      price: 39, discountPrice: 0, category: 'Books & Stationery', brand: 'Atelier', stock: 80, rating: 4.7, numReviews: 45,
      images: [img('1544716278-ca5e3f4abd8c')], tags: ['notebook', 'gift'],
    },
    // ── Batch 2 ──────────────────────────────────────────────
    {
      vendor: tech._id,
      title: 'Pulse S2 Smartwatch',
      description: 'A bright always-on display, seven-day battery, heart-rate and sleep tracking, and swim-proof to 50 metres. Pairs with any phone.',
      price: 229, discountPrice: 189, category: 'Electronics', brand: 'Pulse', stock: 40, rating: 4.6, numReviews: 58, isFeatured: true,
      images: [img('1546868871-7041f2a55e12')], tags: ['wearable', 'fitness'],
    },
    {
      vendor: tech._id,
      title: 'StudioLine Wired Headphones',
      description: 'Tuned for accurate studio sound with plush memory-foam ear cushions and a detachable cable. Folds flat for the bag.',
      price: 99, discountPrice: 0, category: 'Electronics', brand: 'StudioLine', stock: 65, rating: 4.4, numReviews: 31,
      images: [img('1583394838336-acd977736f90')], tags: ['audio', 'studio'],
    },
    {
      vendor: urban._id,
      title: 'Everyday Heavyweight Hoodie',
      description: 'A 450 gsm brushed-fleece hoodie with a roomy hood and ribbed cuffs. Soft inside, sturdy outside, built to be worn on repeat.',
      price: 79, discountPrice: 64, category: 'Fashion & Apparel', brand: 'Common Thread', stock: 90, rating: 4.7, numReviews: 112, isFeatured: true,
      images: [img('1556821840-3a63f95609a7')], tags: ['hoodie', 'streetwear'],
    },
    {
      vendor: urban._id,
      title: 'Aero Bomber Jacket',
      description: 'A lightweight satin-finish bomber with a ribbed collar and hem, two zip pockets and a quilted lining for early-spring evenings.',
      price: 139, discountPrice: 0, category: 'Fashion & Apparel', brand: 'Aero', stock: 28, rating: 4.5, numReviews: 47,
      images: [img('1591047139829-d91aecb6caea')], tags: ['jacket', 'outerwear'],
    },
    {
      vendor: urban._id,
      title: 'Retro Graphic Tee',
      description: 'A midweight cotton tee with a bold screen-printed graphic that stays sharp wash after wash. Relaxed, easy fit.',
      price: 35, discountPrice: 0, category: 'Fashion & Apparel', brand: 'Common Thread', stock: 120, rating: 4.3, numReviews: 64,
      images: [img('1576566588028-4147f3842f27')], tags: ['tee', 'graphic'],
    },
    {
      vendor: urban._id,
      title: 'Sunrise Jogger Set',
      description: 'A matching cropped hoodie and relaxed joggers in a sunny colourway. Cosy french-terry cotton with an elastic drawcord waist.',
      price: 109, discountPrice: 89, category: 'Fashion & Apparel', brand: 'Sunrise', stock: 36, rating: 4.6, numReviews: 39,
      images: [img('1515886657613-9f3515b0c78f')], tags: ['loungewear', 'set'],
    },
    {
      vendor: urban._id,
      title: 'Studio Glow Makeup Set',
      description: 'Everything for a polished everyday look: powder brushes, a bronzer compact, a creamy lipstick and a volumising mascara.',
      price: 74, discountPrice: 59, category: 'Beauty & Health', brand: 'Studio Glow', stock: 55, rating: 4.5, numReviews: 83,
      images: [img('1596462502278-27bfdc403348')], tags: ['makeup', 'gift'],
    },
    {
      vendor: urban._id,
      title: 'FlexFit Performance Leggings',
      description: 'High-rise, four-way stretch leggings with a squat-proof, sweat-wicking fabric and a hidden waistband pocket.',
      price: 59, discountPrice: 0, category: 'Sports & Outdoors', brand: 'FlexFit', stock: 75, rating: 4.7, numReviews: 141, isFeatured: true,
      images: [img('1571019613454-1cb2f99b2d8b')], tags: ['workout', 'activewear'],
    },
    {
      vendor: urban._id,
      title: 'Enamel Cast Iron Dutch Oven',
      description: 'A 5-litre enamelled cast-iron pot that locks in moisture and heat evenly. Oven-safe, hob-safe and handsome enough to serve from.',
      price: 149, discountPrice: 119, category: 'Home & Kitchen', brand: 'Hearth', stock: 22, rating: 4.9, numReviews: 96,
      images: [img('1556909114-f6e7ad7d3136')], tags: ['cookware', 'kitchen'],
    },
    {
      vendor: urban._id,
      title: 'Ceramic Latte Cup Set',
      description: 'Four hand-glazed stoneware cups with a comfortable thumb-rest handle. Microwave and dishwasher safe.',
      price: 45, discountPrice: 0, category: 'Home & Kitchen', brand: 'Hearth', stock: 60, rating: 4.6, numReviews: 52,
      images: [img('1495474472287-4d71bcdd2085')], tags: ['coffee', 'tableware'],
    },
  ];

  let added = 0;
  for (const p of products) {
    // Existing products keep their data but have their images re-synced from this file
    if (await Product.exists({ title: p.title })) {
      await Product.updateOne({ title: p.title }, { $set: { images: p.images } });
      continue;
    }
    await Product.create(p);
    added += 1;
  }
  console.log(`[addProducts] Added ${added} new product(s), skipped ${products.length - added} existing.`);
} catch (err) {
  console.error(`[addProducts] ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
