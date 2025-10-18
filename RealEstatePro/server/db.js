const mysql = require('mysql2/promise');

// Log the database configuration (without password for security)
console.log('Database Configuration:', {
  host: process.env.MYSQL_DB_HOST || 'NOT SET',
  user: process.env.MYSQL_DB_USER || 'NOT SET',
  database: process.env.MYSQL_DB_NAME || 'NOT SET',
  password: process.env.MYSQL_DB_PASSWORD ? '***SET***' : 'NOT SET'
});

const pool = mysql.createPool({
  host: process.env.MYSQL_DB_HOST || 'localhost',
  user: process.env.MYSQL_DB_USER || 'root',
  password: process.env.MYSQL_DB_PASSWORD || 'root',
  database: process.env.MYSQL_DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = {
  // The query function now uses pool.execute for prepared statements
  query: (sql, params) => pool.execute(sql, params),
};