require('dotenv').config();
const { connectDB, mongoose } = require('./mongodb');
const bcrypt = require('bcrypt');

// Import all models
const Admin = require('./models/Admin');
const RealEstateProject = require('./models/RealEstateProject');

async function setupMongoDB() {
    console.log('🚀 Setting up BlueCrumbs MongoDB Database...\n');
    
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ Connected to MongoDB\n');
        
        // Create indexes for better performance
        console.log('Creating indexes...');
        
        // Admin indexes
        await Admin.collection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Admin indexes created');
        
        // Create default admin user if doesn't exist
        const adminEmail = process.env.ADMIN_EMAIL || 'ashutosh@admin.com';
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const admin = new Admin({
                email: adminEmail,
                password: 'admin123' // Will be hashed automatically by the pre-save hook
            });
            
            await admin.save();
            console.log('\n✅ Default admin user created');
            console.log(`📧 Email: ${adminEmail}`);
            console.log('🔑 Password: admin123');
            console.log('⚠️  Please change this password after first login!');
        } else {
            console.log('\nℹ️  Admin user already exists');
        }
        
        // Insert sample real estate projects if none exist
        const projectCount = await RealEstateProject.countDocuments();
        
        if (projectCount === 0) {
            console.log('\nInserting sample real estate projects...');
            
            const sampleProjects = [
                {
                    project_name: 'Eldeco Live By The Greens',
                    builder_name: 'Eldeco Group',
                    project_type: 'Residential',
                    min_price: '₹1.20 Cr',
                    max_price: '₹1.90 Cr',
                    size_sqft: '1137-1404',
                    bhk: '2,3 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'ATS Le Grandiose',
                    builder_name: 'ATS Group',
                    project_type: 'Residential',
                    min_price: '₹1.50 Cr',
                    max_price: '₹3.52 Cr',
                    size_sqft: '1,625 - 3,200',
                    bhk: '3,4 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'ACE Parkway',
                    builder_name: 'ACE Group',
                    project_type: 'Residential',
                    min_price: '₹1.50 Cr',
                    max_price: '₹4.60 Cr',
                    size_sqft: '1,085 - 3200',
                    bhk: '2,3,4 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'ATS Pious Hideaways',
                    builder_name: 'ATS Group',
                    project_type: 'Residential',
                    min_price: '₹1.65 Cr',
                    max_price: '₹2.55 Cr',
                    size_sqft: '1,400 - 1,675',
                    bhk: '3 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'Godrej Nest',
                    builder_name: 'Godrej Properties',
                    project_type: 'Residential',
                    min_price: '₹1.40 Cr',
                    max_price: '₹3.50 Cr',
                    size_sqft: '1262-3027',
                    bhk: '2,3,4 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'Godrej Palm Retreat',
                    builder_name: 'Godrej Properties',
                    project_type: 'Residential',
                    min_price: '₹1.60 Cr',
                    max_price: '₹4.50 Cr',
                    size_sqft: '1265-3198',
                    bhk: '2,3,4 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'ATS Pristine',
                    builder_name: 'ATS Group',
                    project_type: 'Residential',
                    min_price: '₹2.50 Cr',
                    max_price: '₹4.80 Cr',
                    size_sqft: '1750-3200',
                    bhk: '3,4,5 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'Tata Eureka Park',
                    builder_name: 'Tata Value Homes',
                    project_type: 'Residential',
                    min_price: '₹1.20 Cr',
                    max_price: '₹1.79 Cr',
                    size_sqft: '1100-1575',
                    bhk: '2,3 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'ACE Golfshire',
                    builder_name: 'ACE Group',
                    project_type: 'Residential',
                    min_price: '₹1.30 Cr',
                    max_price: '₹2.75 Cr',
                    size_sqft: '1,195 - 2,095',
                    bhk: '2,3 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                },
                {
                    project_name: 'Samridhi Luxuriya Avenue',
                    builder_name: 'Samridhi Group',
                    project_type: 'Residential',
                    min_price: '₹1.30 Cr',
                    max_price: '₹2.20 Cr',
                    size_sqft: '1,165 - 1,690',
                    bhk: '2,3 BHK',
                    status_possession: 'Ready',
                    location: 'Sector 150 Noida'
                }
            ];
            
            await RealEstateProject.insertMany(sampleProjects);
            console.log(`✅ Inserted ${sampleProjects.length} sample projects`);
        } else {
            console.log(`\nℹ️  ${projectCount} projects already exist in database`);
        }
        
        console.log('\n✅ MongoDB setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Make sure MongoDB is running');
        console.log('2. Run: node server-mongodb.js (to start the server with MongoDB)');
        console.log('3. Access admin panel at: http://localhost:3000/admin');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Tips:');
        console.error('- Make sure MongoDB is running');
        console.error('- Check your .env file for MONGODB_URI');
        console.error('- For local MongoDB: mongodb://localhost:27017/bluecrumbs');
        console.error('- For MongoDB Atlas: Use your connection string');
        process.exit(1);
    }
}

setupMongoDB();
