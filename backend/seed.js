require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation and up to 30 hours battery life.',
    price: 10999,
    category: 'Electronics',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1518441902117-4c8b5f9e3a1a?w=400'
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with heart rate monitoring, fitness tracking, and smartphone notifications.',
    price: 18999,
    category: 'Electronics',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400'
  },
  {
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand designed to improve posture and airflow during long work sessions.',
    price: 2999,
    category: 'Electronics',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400'
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Stylish and durable denim jacket suitable for casual wear in all seasons.',
    price: 3499,
    category: 'Clothing',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'
  },
  {
    name: 'Cotton T-Shirt Pack',
    description: 'Pack of three soft and breathable cotton t-shirts for everyday comfort.',
    price: 999,
    category: 'Clothing',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1520975922284-8b456906c813?w=400'
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight running shoes with cushioned sole for maximum comfort and performance.',
    price: 4999,
    category: 'Clothing',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1528701800489-20be9c3d2f2d?w=400'
  },
  {
    name: 'Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and eye-care lighting technology.',
    price: 2499,
    category: 'Home',
    stock: 75,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'
  },
  {
    name: 'Throw Blanket',
    description: 'Ultra-soft fleece throw blanket perfect for sofa, bed, or travel use.',
    price: 1499,
    category: 'Home',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1582582429416-7c9c9b6f6a1a?w=400'
  },
  {
    name: 'Ceramic Coffee Set',
    description: 'Elegant set of four ceramic coffee mugs ideal for home or office use.',
    price: 1799,
    category: 'Home',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Classic programming book by Douglas Crockford covering core JavaScript concepts.',
    price: 799,
    category: 'Books',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'
  },
  {
    name: 'Clean Code',
    description: 'Famous software engineering book by Robert C. Martin about writing maintainable code.',
    price: 999,
    category: 'Books',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip eco-friendly yoga mat suitable for yoga, stretching, and home workouts.',
    price: 899,
    category: 'Sports',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400'
  },
  {
    name: 'Dumbbell Set',
    description: 'Adjustable dumbbell set for strength training and full-body workouts at home.',
    price: 5499,
    category: 'Sports',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=400'
  },
  {
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for up to 24 hours.',
    price: 599,
    category: 'Sports',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400'
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact waterproof Bluetooth speaker with deep bass and long battery backup.',
    price: 3499,
    category: 'Electronics',
    stock: 65,
    image: 'https://images.unsplash.com/photo-1585386959984-a41552231658?w=400'
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile switches ideal for gaming and productivity.',
    price: 6999,
    category: 'Electronics',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400'
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and silent click buttons.',
    price: 1299,
    category: 'Electronics',
    stock: 85,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'
  },
  {
    name: 'Leather Messenger Bag',
    description: 'Premium genuine leather messenger bag suitable for office and travel use.',
    price: 5499,
    category: 'Clothing',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'
  },
  {
    name: 'Winter Wool Scarf',
    description: 'Soft merino wool scarf designed to provide warmth and style in winter.',
    price: 999,
    category: 'Clothing',
    stock: 70,
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400'
  },
  {
    name: 'Canvas Backpack',
    description: 'Durable waterproof canvas backpack with padded laptop compartment.',
    price: 2499,
    category: 'Clothing',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@shop.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Test User',
    email: 'user@shop.com',
    password: 'user123',
    role: 'user',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env.');
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  // Clear existing data
  await Product.deleteMany({});
  await User.deleteMany({});

  // Seed products
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  // Seed users (password hashing happens via pre-save hook)
  for (const u of users) {
    await User.create(u);
  }
  console.log(`Seeded ${users.length} users:`);
  console.log('  Admin: admin@shop.com / admin123');
  console.log('  User:  user@shop.com  / user123');

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
