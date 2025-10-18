const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Setting up BlueCrumbs Database...\n');
    
    try {
        // Connect without database first
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_DB_HOST,
            user: process.env.MYSQL_DB_USER,
            password: process.env.MYSQL_DB_PASSWORD
        });
        
        console.log('✅ Connected to MySQL');
        
        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB_NAME}`);
        console.log(`✅ Database '${process.env.MYSQL_DB_NAME}' ready`);
        
        await connection.query(`USE ${process.env.MYSQL_DB_NAME}`);
        
        // Create inquiries table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                message TEXT,
                source VARCHAR(100) DEFAULT 'Website Form',
                received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_received_at (received_at),
                INDEX idx_source (source)
            )
        `);
        console.log('✅ Table "inquiries" ready');
        
        // Create admins table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "admins" ready');
        
        // Create career_submissions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS career_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                position VARCHAR(100) NOT NULL,
                experience VARCHAR(50),
                resume VARCHAR(500),
                status VARCHAR(50) DEFAULT 'pending',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_submitted_at (submitted_at)
            )
        `);
        console.log('✅ Table "career_submissions" ready');
        
        // Create newsletter_subscriptions table (Simplified - Email Only)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            )
        `);
        console.log('✅ Table "newsletter_subscriptions" ready');
        
        // Create real_estate_projects table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS real_estate_projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_name VARCHAR(255),
                builder_name VARCHAR(255),
                project_type VARCHAR(100),
                min_price VARCHAR(50),
                max_price VARCHAR(50),
                size_sqft VARCHAR(100),
                bhk VARCHAR(50),
                status_possession VARCHAR(100),
                location VARCHAR(150),
                INDEX idx_location (location),
                INDEX idx_builder (builder_name),
                INDEX idx_bhk (bhk),
                INDEX idx_status (status_possession)
            )
        `);
        console.log('✅ Table "real_estate_projects" ready');
        
        await connection.end();
        
        console.log('\n✅ Database setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Run: node createAdmin.js (to create admin user)');
        console.log('2. Run: node server.js (to start the server)');
        console.log('3. Run: node test-db.js (to test database connection)');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Tips:');
        console.error('- Make sure MySQL is running');
        console.error('- Check your .env file credentials');
        console.error('- Verify MySQL user has CREATE DATABASE privileges');
        process.exit(1);
    }
}

setupDatabase();
