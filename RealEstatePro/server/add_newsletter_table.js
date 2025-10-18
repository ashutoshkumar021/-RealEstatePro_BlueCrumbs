require('dotenv').config();
const mysql = require('mysql2/promise');

async function addNewsletterTable() {
    let connection;
    
    try {
        // Connect to the database
        connection = await mysql.createConnection({
            host: process.env.MYSQL_DB_HOST || 'localhost',
            user: process.env.MYSQL_DB_USER || 'root',
            password: process.env.MYSQL_DB_PASSWORD || 'root',
            database: process.env.MYSQL_DB_NAME || 'test'
        });
        
        console.log('✅ Connected to database');
        
        // Create newsletter_subscriptions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255),
                status ENUM('active', 'unsubscribed') DEFAULT 'active',
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP NULL,
                ip_address VARCHAR(45),
                source VARCHAR(100) DEFAULT 'Website',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_subscribed_at (subscribed_at)
            )
        `);
        
        console.log('✅ Table "newsletter_subscriptions" created successfully');
        
        // Check if table was created
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'newsletter_subscriptions'"
        );
        
        if (tables.length > 0) {
            console.log('✅ Verified: newsletter_subscriptions table exists');
            
            // Get table structure
            const [columns] = await connection.query(
                "DESCRIBE newsletter_subscriptions"
            );
            
            console.log('\n📊 Table structure:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️ Table already exists');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the function
addNewsletterTable();
