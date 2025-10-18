require('dotenv').config();
const mysql = require('mysql2/promise');

async function insertSampleProjects() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_DB_HOST || 'localhost',
            user: process.env.MYSQL_DB_USER || 'root',
            password: process.env.MYSQL_DB_PASSWORD || 'root',
            database: process.env.MYSQL_DB_NAME || 'test'
        });
        
        console.log('✅ Connected to database');
        
        // Sample data
        const projects = [
            ['Eldeco Live By The Greens', 'Eldeco Group', 'Residential', '₹1.20 Cr', '₹1.90 Cr', '1137-1404', '2,3 BHK', 'Ready', 'Sector 150 Noida'],
            ['ATS Le Grandiose', 'ATS Group', 'Residential', '₹1.50 Cr', '₹3.52 Cr', '1,625 - 3,200', '3,4 BHK', 'Ready', 'Sector 150 Noida'],
            ['ACE Parkway', 'ACE Group', 'Residential', '₹1.50 Cr', '₹4.60 Cr', '1,085 - 3200', '2,3,4 BHK', 'Ready', 'Sector 150 Noida'],
            ['ATS Pious Hideaways', 'ATS Group', 'Residential', '₹1.65 Cr', '₹2.55 Cr', '1,400 - 1,675', '3 BHK', 'Ready', 'Sector 150 Noida'],
            ['Godrej Nest', 'Godrej Properties', 'Residential', '₹1.40 Cr', '₹3.50 Cr', '1262-3027', '2,3,4 BHK', 'Ready', 'Sector 150 Noida'],
            ['Godrej Palm Retreat', 'Godrej Properties', 'Residential', '₹1.60 Cr', '₹4.50 Cr', '1265-3198', '2,3,4 BHK', 'Ready', 'Sector 150 Noida'],
            ['ATS Pristine', 'ATS Group', 'Residential', '₹2.50 Cr', '₹4.80 Cr', '1750-3200', '3,4,5 BHK', 'Ready', 'Sector 150 Noida'],
            ['Tata Eureka Park', 'Tata Value Homes', 'Residential', '₹1.20 Cr', '₹1.79 Cr', '1100-1575', '2,3 BHK', 'Ready', 'Sector 150 Noida'],
            ['ACE Golfshire', 'ACE Group', 'Residential', '₹1.30 Cr', '₹2.75 Cr', '1,195 - 2,095', '2,3 BHK', 'Ready', 'Sector 150 Noida'],
            ['Samridhi Luxuriya Avenue', 'Samridhi Group', 'Residential', '₹1.30 Cr', '₹2.20 Cr', '1,165 - 1,690', '2,3 BHK', 'Ready', 'Sector 150 Noida']
        ];
        
        // Insert sample data
        const insertQuery = `
            INSERT INTO real_estate_projects 
            (project_name, builder_name, project_type, min_price, max_price, size_sqft, bhk, status_possession, location) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        let insertedCount = 0;
        let skippedCount = 0;
        
        for (const project of projects) {
            try {
                await connection.execute(insertQuery, project);
                console.log(`✅ Inserted: ${project[0]}`);
                insertedCount++;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️ Skipped (already exists): ${project[0]}`);
                    skippedCount++;
                } else {
                    console.error(`❌ Error inserting ${project[0]}:`, err.message);
                }
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`✅ Inserted: ${insertedCount} projects`);
        console.log(`⚠️ Skipped: ${skippedCount} projects`);
        
        // Verify data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM real_estate_projects');
        console.log(`\n📈 Total projects in database: ${rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the function
insertSampleProjects();
