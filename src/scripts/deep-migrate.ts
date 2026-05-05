import mongoose from 'mongoose';
import User from './src/models/User';
import Order from './src/models/Order';
import Product from './src/models/Product';
import Category from './src/models/Category';
import connectToDatabase from './src/lib/db';

async function migrate() {
    try {
        console.log('Connecting to database...');
        await connectToDatabase();
        
        // Ensure models are registered
        const collections = [
            { name: 'User', model: User },
            { name: 'Order', model: Order },
            { name: 'Product', model: Product },
            { name: 'Category', model: Category }
        ];

        // Also check for other models that might not be imported yet but exist in DB
        const otherModels = ['Coupon', 'Expense', 'GlobalSettings'];

        for (const item of collections) {
            console.log(`Migrating ${item.name}...`);
            const result = await item.model.updateMany(
                { 
                    $or: [
                        { domain: 'unknown' }, 
                        { domain: { $exists: false } }, 
                        { domain: '' }, 
                        { domain: null }
                    ] 
                }, 
                { $set: { domain: 'janopriyo.com' } }
            );
            console.log(`Updated ${result.modifiedCount} documents in ${item.name}.`);
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
