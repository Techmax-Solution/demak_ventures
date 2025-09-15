import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

dotenv.config();

const sampleProducts = [
    {
        name: "Classic Cotton T-Shirt",
        description: "A comfortable, breathable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a relaxed fit.",
        price: 24.99,
        originalPrice: 29.99,
        categoryName: "Men", // Will be converted to ObjectId
        subcategory: "t-shirts",
        brand: "ComfortWear",
        sizes: [
            { size: "S", quantity: 15 },
            { size: "M", quantity: 20 },
            { size: "L", quantity: 18 },
            { size: "XL", quantity: 12 }
        ],
        colors: [
            { color: "White", hexCode: "#FFFFFF" },
            { color: "Black", hexCode: "#000000" },
            { color: "Navy", hexCode: "#1E3A8A" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", alt: "Classic Cotton T-Shirt" }
        ],
        tags: ["casual", "cotton", "basic", "comfortable"],
        material: "100% Organic Cotton",
        careInstructions: ["Machine wash cold", "Tumble dry low", "Do not bleach"],
        featured: true,
        onSale: true
    },
    {
        name: "Denim Skinny Jeans",
        description: "Stylish skinny jeans made from premium denim with stretch for comfort and mobility. Features a modern cut and classic five-pocket design.",
        price: 79.99,
        originalPrice: 99.99,
        categoryName: "Women", // Will be converted to ObjectId
        subcategory: "jeans",
        brand: "DenimCo",
        sizes: [
            { size: "28", quantity: 10 },
            { size: "30", quantity: 15 },
            { size: "32", quantity: 12 },
            { size: "34", quantity: 8 }
        ],
        colors: [
            { color: "Dark Blue", hexCode: "#1E3A8A" },
            { color: "Light Blue", hexCode: "#3B82F6" },
            { color: "Black", hexCode: "#000000" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1542272604-787c3835535d", alt: "Denim Skinny Jeans" }
        ],
        tags: ["denim", "skinny", "stretch", "modern"],
        material: "98% Cotton, 2% Elastane",
        careInstructions: ["Machine wash cold", "Turn inside out", "Do not bleach", "Hang dry"],
        featured: false,
        onSale: true
    },
    {
        name: "Wool Blend Sweater",
        description: "Cozy wool blend sweater perfect for cooler weather. Features a classic crew neck design with ribbed cuffs and hem.",
        price: 89.99,
        categoryName: "Women", // Will be converted to ObjectId
        subcategory: "sweaters",
        brand: "WarmWear",
        sizes: [
            { size: "XS", quantity: 8 },
            { size: "S", quantity: 12 },
            { size: "M", quantity: 15 },
            { size: "L", quantity: 10 },
            { size: "XL", quantity: 6 }
        ],
        colors: [
            { color: "Cream", hexCode: "#F5F5DC" },
            { color: "Gray", hexCode: "#808080" },
            { color: "Burgundy", hexCode: "#800020" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105", alt: "Wool Blend Sweater" }
        ],
        tags: ["wool", "warm", "cozy", "classic"],
        material: "70% Wool, 30% Acrylic",
        careInstructions: ["Hand wash cold", "Lay flat to dry", "Do not wring"],
        featured: true,
        onSale: false
    },
    {
        name: "Running Sneakers",
        description: "High-performance running sneakers with advanced cushioning and breathable mesh upper. Perfect for daily runs and workouts.",
        price: 129.99,
        categoryName: "Shoes", // Will be converted to ObjectId
        subcategory: "athletic",
        brand: "SportMax",
        sizes: [
            { size: "7", quantity: 5 },
            { size: "8", quantity: 8 },
            { size: "9", quantity: 12 },
            { size: "10", quantity: 10 },
            { size: "11", quantity: 6 }
        ],
        colors: [
            { color: "White/Blue", hexCode: "#FFFFFF" },
            { color: "Black/Red", hexCode: "#000000" },
            { color: "Gray/Green", hexCode: "#808080" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772", alt: "Running Sneakers" }
        ],
        tags: ["running", "athletic", "comfortable", "breathable"],
        material: "Synthetic mesh and rubber sole",
        careInstructions: ["Wipe clean with damp cloth", "Air dry", "Do not machine wash"],
        featured: true,
        onSale: false
    },
    {
        name: "Kids Rainbow Hoodie",
        description: "Fun and colorful hoodie for kids featuring a rainbow design. Made from soft cotton blend for all-day comfort.",
        price: 34.99,
        categoryName: "Kids", // Will be converted to ObjectId
        subcategory: "hoodies",
        brand: "KidStyle",
        sizes: [
            { size: "XS", quantity: 10 },
            { size: "S", quantity: 15 },
            { size: "M", quantity: 12 },
            { size: "L", quantity: 8 }
        ],
        colors: [
            { color: "Multi-color", hexCode: "#FF6B6B" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2", alt: "Kids Rainbow Hoodie" }
        ],
        tags: ["kids", "colorful", "fun", "comfortable"],
        material: "80% Cotton, 20% Polyester",
        careInstructions: ["Machine wash warm", "Tumble dry medium", "Do not iron design"],
        featured: false,
        onSale: false
    },
    {
        name: "Leather Crossbody Bag",
        description: "Elegant leather crossbody bag perfect for everyday use. Features multiple compartments and an adjustable strap.",
        price: 149.99,
        originalPrice: 199.99,
        categoryName: "Bags", // Will be converted to ObjectId
        subcategory: "crossbody",
        brand: "LeatherCraft",
        sizes: [
            { size: "One Size", quantity: 20 }
        ],
        colors: [
            { color: "Brown", hexCode: "#8B4513" },
            { color: "Black", hexCode: "#000000" },
            { color: "Tan", hexCode: "#D2B48C" }
        ],
        images: [
            { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", alt: "Leather Crossbody Bag" }
        ],
        tags: ["leather", "elegant", "practical", "crossbody"],
        material: "Genuine Leather",
        careInstructions: ["Clean with leather conditioner", "Store in dust bag", "Keep away from water"],
        featured: true,
        onSale: true
    }
];

const sampleUsers = [
    {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "admin",
        address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "United States"
        },
        phone: "+1-555-0123"
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "user",
        address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "United States"
        },
        phone: "+1-555-0456"
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        await connectDB();
        
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({});
        
        // Create users first
        console.log('👥 Creating sample users...');
        const createdUsers = await User.create(sampleUsers);
        console.log(`✅ Created ${createdUsers.length} users`);
        
        // Get or create categories
        console.log('📂 Setting up categories...');
        const categories = await Category.find({});
        if (categories.length === 0) {
            console.log('Creating categories...');
            const categoryData = [
                { name: 'Men', description: 'Men\'s clothing and accessories', sortOrder: 1 },
                { name: 'Women', description: 'Women\'s clothing and accessories', sortOrder: 2 },
                { name: 'Kids', description: 'Children\'s clothing and accessories', sortOrder: 3 },
                { name: 'Shoes', description: 'Footwear for all occasions', sortOrder: 4 },
                { name: 'Bags', description: 'Handbags, backpacks, and luggage', sortOrder: 5 }
            ];
            await Category.create(categoryData);
            console.log('✅ Categories created');
        }
        
        // Get category references
        const categoryMap = {};
        const allCategories = await Category.find({});
        allCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });
        
        // Create products with proper category references
        console.log('📦 Creating sample products...');
        const productsWithCategories = sampleProducts.map(product => {
            const { categoryName, ...productData } = product;
            return {
                ...productData,
                category: categoryMap[categoryName]
            };
        });
        
        const createdProducts = await Product.create(productsWithCategories);
        console.log(`✅ Created ${createdProducts.length} products`);
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Seeded Data Summary:');
        console.log(`   👥 Users: ${createdUsers.length}`);
        console.log(`   📦 Products: ${createdProducts.length}`);
        console.log(`   📂 Categories: ${allCategories.length}`);
        
        console.log('\n🔐 Sample Login Credentials:');
        console.log('   Admin: john@example.com / password123');
        console.log('   User:  jane@example.com / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
if (process.argv[2] === '--seed') {
    seedDatabase();
} else {
    console.log('Usage: node seedDatabase.js --seed');
}

export default seedDatabase;
