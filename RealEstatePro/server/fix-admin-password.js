require('dotenv').config();
const db = require('./db');

async function fixAdminTable() {
    try {
        console.log('Checking admins table structure...');
        
        // First, check if the password column exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'test' 
            AND TABLE_NAME = 'admins' 
            AND COLUMN_NAME = 'password'
        `);
        
        if (columns.length === 0) {
            console.log('Password column not found. Adding it now...');
            
            // Add the password column
            await db.query(`
                ALTER TABLE admins 
                ADD COLUMN password VARCHAR(255) DEFAULT NULL
            `);
            
            console.log('✅ Password column added successfully!');
        } else {
            console.log('✅ Password column already exists.');
        }
        
        // Check if admin exists
        const [admins] = await db.query('SELECT * FROM admins');
        
        if (admins.length === 0) {
            console.log('No admin users found. Creating default admin...');
            
            // Create default admin
            await db.query(`
                INSERT INTO admins (email, created_at) 
                VALUES ('ashutosh@admin.com', NOW())
            `);
            
            console.log('✅ Default admin created: ashutosh@admin.com');
            console.log('⚠️  Please reset the password using the "Forgot Password" link on the login page.');
        } else {
            console.log(`✅ Admin user found: ${admins[0].email}`);
            if (!admins[0].password) {
                console.log('⚠️  Admin password is not set. Please reset it using the "Forgot Password" link.');
            }
        }
        
        console.log('\n✅ Database fix completed successfully!');
        console.log('You can now reset the admin password through the web interface.');
        
    } catch (error) {
        console.error('Error fixing admin table:', error);
    } finally {
        process.exit();
    }
}

fixAdminTable();
