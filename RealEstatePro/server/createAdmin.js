require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  rl.question('Enter admin password: ', async (password) => {
    if (!password) {
      console.error('Password cannot be empty.');
      rl.close();
      process.exit(); // Exit the process
    }
    
    const email = process.env.ADMIN_EMAIL;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      // MySQL uses '?' for placeholders
      const query = 'INSERT INTO admins (email, password_hash) VALUES (?, ?)';
      await db.query(query, [email, hashedPassword]);
      console.log(`Admin user ${email} created successfully!`);
    } catch (error) {
      console.error('Error creating admin user:', error.message);
    } finally {
      rl.close();
      // We need to find a way to close the pool connection
      const pool = require('./db'); // This is a simple way, but not ideal
      // In a real app you might export a close function from db.js
      process.exit(); 
    }
  });
}

createAdmin();