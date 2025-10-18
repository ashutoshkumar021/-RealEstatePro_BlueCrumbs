const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
    console.log('='.repeat(60));
    console.log('DATABASE CONNECTION TEST');
    console.log('='.repeat(60));
    
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_DB_HOST,
            user: process.env.MYSQL_DB_USER,
            password: process.env.MYSQL_DB_PASSWORD,
            database: process.env.MYSQL_DB_NAME
        });
        
        console.log('✅ Database connection successful!');
        console.log('Database:', process.env.MYSQL_DB_NAME);
        console.log('Host:', process.env.MYSQL_DB_HOST);
        console.log('User:', process.env.MYSQL_DB_USER);
        console.log('');
        
        // Check if inquiries table exists
        console.log('Checking for inquiries table...');
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'inquiries'"
        );
        
        if (tables.length === 0) {
            console.log('❌ Table "inquiries" does not exist!');
            console.log('Creating table...');
            
            await connection.query(`
                CREATE TABLE inquiries (
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
            
            console.log('✅ Table "inquiries" created successfully!');
        } else {
            console.log('✅ Table "inquiries" exists!');
        }
        
        // Check table structure
        console.log('');
        console.log('Table structure:');
        const [columns] = await connection.query('DESCRIBE inquiries');
        console.table(columns);
        
        // Check if there are any records
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM inquiries');
        console.log('');
        console.log(`Total inquiries in database: ${rows[0].count}`);
        
        // Show last 5 inquiries
        if (rows[0].count > 0) {
            console.log('');
            console.log('Last 5 inquiries:');
            const [lastFive] = await connection.query(
                'SELECT id, name, email, phone, source, received_at FROM inquiries ORDER BY received_at DESC LIMIT 5'
            );
            console.table(lastFive);
        }
        
        // Test insert
        console.log('');
        console.log('Testing INSERT operation...');
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '9876543210',
            message: 'This is a test inquiry',
            source: 'Database Test Script'
        };
        
        const [insertResult] = await connection.query(
            'INSERT INTO inquiries (name, email, phone, message, source) VALUES (?, ?, ?, ?, ?)',
            [testData.name, testData.email, testData.phone, testData.message, testData.source]
        );
        
        console.log('✅ Test inquiry inserted successfully!');
        console.log('Insert ID:', insertResult.insertId);
        
        // Delete test record
        await connection.query('DELETE FROM inquiries WHERE id = ?', [insertResult.insertId]);
        console.log('✅ Test inquiry deleted (cleanup)');
        
        await connection.end();
        
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ ALL TESTS PASSED! Database is ready.');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('❌ ERROR:', error.message);
        console.error('='.repeat(60));
        console.error('');
        console.error('Troubleshooting:');
        console.error('1. Is MySQL running?');
        console.error('2. Are the credentials in .env correct?');
        console.error('3. Does the database exist?');
        console.error('   Run: CREATE DATABASE test;');
        console.error('');
        process.exit(1);
    }
}

testDatabase();
