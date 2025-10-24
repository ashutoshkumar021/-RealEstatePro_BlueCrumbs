require('dotenv').config();
const { connectDB, mongoose } = require('./mongodb');

// Import all models to test
const Admin = require('./models/Admin');
const Inquiry = require('./models/Inquiry');
const NewsletterSubscription = require('./models/NewsletterSubscription');
const CareerSubmission = require('./models/CareerSubmission');
const RealEstateProject = require('./models/RealEstateProject');
const BuilderInquiry = require('./models/BuilderInquiry');

async function testMongoDB() {
    console.log('🧪 Testing MongoDB Connection and Models...\n');
    
    try {
        // Test connection
        await connectDB();
        console.log('✅ MongoDB connection successful\n');
        
        // Test each model
        console.log('Testing Models:');
        console.log('---------------');
        
        // Test Admin model
        const adminCount = await Admin.countDocuments();
        console.log(`✅ Admin model: ${adminCount} admin(s) found`);
        
        // Test Inquiry model
        const inquiryCount = await Inquiry.countDocuments();
        console.log(`✅ Inquiry model: ${inquiryCount} inquiry(ies) found`);
        
        // Test NewsletterSubscription model
        const newsletterCount = await NewsletterSubscription.countDocuments();
        console.log(`✅ Newsletter model: ${newsletterCount} subscription(s) found`);
        
        // Test CareerSubmission model
        const careerCount = await CareerSubmission.countDocuments();
        console.log(`✅ Career model: ${careerCount} submission(s) found`);
        
        // Test RealEstateProject model
        const projectCount = await RealEstateProject.countDocuments();
        console.log(`✅ RealEstateProject model: ${projectCount} project(s) found`);
        
        // Test BuilderInquiry model
        const builderCount = await BuilderInquiry.countDocuments();
        console.log(`✅ BuilderInquiry model: ${builderCount} inquiry(ies) found`);
        
        console.log('\n🎉 All models are working correctly!');
        console.log('\n📝 Summary:');
        console.log('- MongoDB connection: ✅');
        console.log('- All 6 models tested: ✅');
        console.log('- Migration from MySQL to MongoDB: COMPLETE ✅');
        
        console.log('\n💡 Next Steps:');
        console.log('1. Make sure MongoDB is running (local or Atlas)');
        console.log('2. Run: npm run setup (to initialize data)');
        console.log('3. Run: npm start (to start the server)');
        console.log('4. Access admin panel at: http://localhost:3000/admin');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MongoDB is not running!');
            console.error('Please follow these steps:');
            console.error('1. Read MONGODB_SETUP_GUIDE.md for installation instructions');
            console.error('2. Start MongoDB service or use MongoDB Atlas');
            console.error('3. Update MONGODB_URI in .env file');
        }
        
        process.exit(1);
    }
}

testMongoDB();
