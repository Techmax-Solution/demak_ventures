import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Seed categories
        const categories = [
            {
                name: 'Men',
                description: 'Men\'s clothing and accessories',
                sortOrder: 1,
                seoTitle: 'Men\'s Fashion - Latest Trends',
                seoDescription: 'Discover the latest men\'s fashion trends and styles'
            },
            {
                name: 'Women',
                description: 'Women\'s clothing and accessories',
                sortOrder: 2,
                seoTitle: 'Women\'s Fashion - Latest Trends',
                seoDescription: 'Discover the latest women\'s fashion trends and styles'
            },
            {
                name: 'Kids',
                description: 'Children\'s clothing and accessories',
                sortOrder: 3,
                seoTitle: 'Kids Fashion - Latest Trends',
                seoDescription: 'Discover the latest kids\' fashion trends and styles'
            },
            {
                name: 'Accessories',
                description: 'Fashion accessories for all ages',
                sortOrder: 4,
                seoTitle: 'Fashion Accessories',
                seoDescription: 'Complete your look with our stylish accessories'
            },
            {
                name: 'Shoes',
                description: 'Footwear for all occasions',
                sortOrder: 5,
                seoTitle: 'Shoes & Footwear',
                seoDescription: 'Step up your style with our collection of shoes'
            },
            {
                name: 'Bags',
                description: 'Handbags, backpacks, and luggage',
                sortOrder: 6,
                seoTitle: 'Bags & Handbags',
                seoDescription: 'Carry your essentials in style with our bag collection'
            }
        ];

        // Create categories one by one to ensure slug generation
        const createdCategories = [];
        for (const categoryData of categories) {
            const category = new Category(categoryData);
            await category.save();
            createdCategories.push(category);
        }
        console.log(`Created ${createdCategories.length} categories`);

        // Create some subcategories
        const menCategory = await Category.findOne({ name: 'Men' });
        const womenCategory = await Category.findOne({ name: 'Women' });

        const subcategories = [
            {
                name: 'T-Shirts',
                description: 'Men\'s t-shirts and casual tops',
                parentCategory: menCategory._id,
                sortOrder: 1
            },
            {
                name: 'Shirts',
                description: 'Men\'s dress shirts and casual shirts',
                parentCategory: menCategory._id,
                sortOrder: 2
            },
            {
                name: 'Pants',
                description: 'Men\'s trousers and jeans',
                parentCategory: menCategory._id,
                sortOrder: 3
            },
            {
                name: 'Dresses',
                description: 'Women\'s dresses for all occasions',
                parentCategory: womenCategory._id,
                sortOrder: 1
            },
            {
                name: 'Tops',
                description: 'Women\'s tops and blouses',
                parentCategory: womenCategory._id,
                sortOrder: 2
            },
            {
                name: 'Bottoms',
                description: 'Women\'s pants, skirts, and shorts',
                parentCategory: womenCategory._id,
                sortOrder: 3
            }
        ];

        // Create subcategories one by one to ensure slug generation
        for (const subcategoryData of subcategories) {
            const subcategory = new Category(subcategoryData);
            await subcategory.save();
        }
        console.log(`Created ${subcategories.length} subcategories`);

        console.log('Category seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
