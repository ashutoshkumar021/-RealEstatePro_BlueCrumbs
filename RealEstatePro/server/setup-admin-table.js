const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdminTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_DB_HOST,
        user: process.env.MYSQL_DB_USER,
        password: process.env.MYSQL_DB_PASSWORD,
        database: process.env.MYSQL_DB_NAME
    });

    try {
        // Create admins table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log('✅ Admins table created successfully');

        // Check if admin user exists
        const [rows] = await connection.execute(
            'SELECT * FROM admins WHERE email = ?',
            [process.env.ADMIN_EMAIL]
        );

        if (rows.length === 0) {
            // Hash the default password
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);
            
            // Insert default admin user
            await connection.execute(
                'INSERT INTO admins (email, password) VALUES (?, ?)',
                [process.env.ADMIN_EMAIL, hashedPassword]
            );
            
            console.log('✅ Default admin user created');
            console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
            console.log('🔑 Password: admin123');
            console.log('⚠️ Please change this password after first login!');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

    } catch (error) {
        console.error('Error setting up admin table:', error);
    } finally {
        await connection.end();
    }
}

setupAdminTable();
