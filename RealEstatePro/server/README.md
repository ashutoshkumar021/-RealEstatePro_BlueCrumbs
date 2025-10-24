# BlueCrumbs Server - MongoDB Version

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher)
   - Local: Install MongoDB Community Edition
   - Cloud: Create a MongoDB Atlas account

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB connection:
   - Edit `.env` file
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/bluecrumbs`
   - For MongoDB Atlas: Use your connection string

## Setup

Run the setup script to initialize the database:
```bash
npm run setup
```

This will:
- Create the database and collections
- Set up indexes for better performance
- Create a default admin user (email: ashutosh@admin.com, password: admin123)
- Insert sample real estate projects

## Running the Server

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Admin Panel

Access the admin panel at: `http://localhost:3000/admin`

Default credentials:
- Email: ashutosh@admin.com
- Password: admin123

**Important:** Change the password after first login!

## API Endpoints

### Public Endpoints
- `POST /api/newsletter` - Newsletter subscription
- `POST /api/career` - Career application submission
- `POST /api/builder-inquiry` - Builder inquiry submission
- `POST /inquiry` - General inquiry
- `GET /api/projects/search` - Search real estate projects
- `GET /api/projects/locations` - Get all locations
- `GET /api/projects/builders` - Get all builders

### Admin Endpoints (Protected)
All admin endpoints require JWT authentication token.

- `POST /api/admin/login` - Admin login
- `POST /api/admin/reset-password` - Reset admin password
- `GET /api/admin/inquiries` - Get all inquiries
- `PUT /api/admin/inquiries/:id` - Update inquiry
- `DELETE /api/admin/inquiries/:id` - Delete inquiry
- `GET /api/admin/newsletter-subscriptions` - Get newsletter subscriptions
- `DELETE /api/admin/newsletter-subscriptions/:id` - Delete subscription
- `GET /api/admin/builder-inquiries` - Get builder inquiries
- `DELETE /api/admin/builder-inquiries/:id` - Delete builder inquiry
- `GET /api/admin/career-submissions` - Get career submissions
- `PUT /api/admin/career-submissions/:id` - Update submission status
- `DELETE /api/admin/career-submissions/:id` - Delete submission
- `POST /api/admin/properties` - Add new property

## Database Collections

- **admins** - Admin users
- **inquiries** - General inquiries
- **newslettersubscriptions** - Newsletter subscribers
- **careersubmissions** - Career applications
- **realestateprojects** - Property listings
- **builderinquiries** - Builder-specific inquiries

## Environment Variables

Required environment variables in `.env`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bluecrumbs

# JWT Secret Key
JWT_SECRET=your-secret-key-here

# Admin Configuration
ADMIN_EMAIL=ashutosh@admin.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
COMPANY_MAIL=company@gmail.com
```

## Troubleshooting

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - For local: `mongod` should be running
   - For Atlas: Check network access and IP whitelist

2. **Port Already in Use**
   - Change PORT in .env file
   - Or kill the process using port 3000

3. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - For Gmail: Use App Password, not regular password
   - Enable "Less secure app access" if needed

## Migration from MySQL

This server has been migrated from MySQL to MongoDB. The old MySQL files have been removed. All data models are now using Mongoose schemas.
