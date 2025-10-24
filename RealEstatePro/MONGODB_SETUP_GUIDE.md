# MongoDB Setup Guide for BlueCrumbs

You need MongoDB to run this application. Choose one of the following options:

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a Free MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Configure Network Access:**
   - In Atlas dashboard, go to Network Access
   - Add your IP address or allow access from anywhere (0.0.0.0/0)

3. **Create Database User:**
   - Go to Database Access
   - Add a new database user with username and password
   - Remember these credentials

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/bluecrumbs?retryWrites=true&w=majority`

5. **Update .env File:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/bluecrumbs?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your actual credentials

## Option 2: Local MongoDB Installation

### For Windows:

1. **Download MongoDB Community Server:**
   - Go to https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Choose the MSI installer

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) if desired

3. **Verify Installation:**
   - Open Command Prompt or PowerShell
   - Run: `mongod --version`
   - You should see the MongoDB version

4. **Start MongoDB Service:**
   - MongoDB should start automatically as a service
   - Or manually start it:
     ```
     net start MongoDB
     ```

5. **Update .env File:**
   ```
   MONGODB_URI=mongodb://localhost:27017/bluecrumbs
   ```

### For macOS:

1. **Install using Homebrew:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

3. **Update .env File:**
   ```
   MONGODB_URI=mongodb://localhost:27017/bluecrumbs
   ```

### For Linux (Ubuntu/Debian):

1. **Install MongoDB:**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Update .env File:**
   ```
   MONGODB_URI=mongodb://localhost:27017/bluecrumbs
   ```

## Testing the Connection

After setting up MongoDB:

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Run the setup script:
   ```
   npm run setup
   ```

3. If successful, you'll see:
   - ✅ Connected to MongoDB
   - ✅ Default admin user created
   - ✅ Sample projects inserted

## Troubleshooting

### Connection Refused Error:
- **Local:** Make sure MongoDB service is running
- **Atlas:** Check network access settings and IP whitelist

### Authentication Failed:
- **Atlas:** Verify username and password in connection string
- **Local:** MongoDB doesn't require authentication by default

### Timeout Error:
- **Atlas:** Check internet connection and firewall settings
- **Local:** Verify MongoDB is listening on port 27017

## Quick Start with MongoDB Atlas (Easiest)

If you want to get started quickly without installing MongoDB locally:

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Add your IP to network access
4. Create a database user
5. Get your connection string
6. Update the `.env` file with your connection string
7. Run `npm run setup` in the server directory

That's it! The application will now use MongoDB Atlas cloud database.
