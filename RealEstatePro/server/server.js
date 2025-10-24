require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connectDB, mongoose } = require('./mongodb');
const mailer = require('./mailer');

// Import all models
const Admin = require('./models/Admin');
const Inquiry = require('./models/Inquiry');
const NewsletterSubscription = require('./models/NewsletterSubscription');
const CareerSubmission = require('./models/CareerSubmission');
const RealEstateProject = require('./models/RealEstateProject');
const BuilderInquiry = require('./models/BuilderInquiry');
const LocationInquiry = require('./models/LocationInquiry');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());

// Add CORS headers for API routes only
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.header('Content-Type', 'application/json');
    }
    next();
});

// Serve static files with proper paths
const publicPath = path.join(__dirname, '..', 'public');
const adminPath = path.join(__dirname, '..', 'admin');

app.use(express.static(publicPath));
app.use('/admin', express.static(adminPath));

// Explicitly handle admin routes
app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(adminPath, 'login.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(adminPath, 'dashboard.html'));
});

// Serve admin CSS and JS files
app.use('/admin/css', express.static(path.join(adminPath, 'css')));
app.use('/admin/js', express.static(path.join(adminPath, 'js')));

// Redirect /admin to /admin/login.html
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

app.get('/admin/', (req, res) => {
    res.redirect('/admin/login.html');
});

// Middleware to protect admin routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// =========================================================================
// ADMIN AUTHENTICATION ENDPOINTS
// =========================================================================

// Admin Login
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ email });

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.password) {
            return res.status(401).json({ error: 'Password not set. Please reset your password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            const accessToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token: accessToken, message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Login (API route)
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ email });

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.password) {
            return res.status(401).json({ error: 'Password not set. Please reset your password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            const accessToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token: accessToken, message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Password Reset
app.post('/api/admin/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
    }
    
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        admin.password = newPassword;
        await admin.save();
        
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// =========================================================================
// NEWSLETTER SUBSCRIPTION ENDPOINTS
// =========================================================================

app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const existing = await NewsletterSubscription.findOne({ email });
        
        if (existing) {
            return res.status(409).json({ error: 'This email is already subscribed to our newsletter' });
        }
        
        const subscription = new NewsletterSubscription({ email });
        await subscription.save();
        
        try {
            const emailResults = await mailer.sendFormEmails('newsletter', {
                email: email,
                name: 'Newsletter Subscriber'
            });
            console.log('Newsletter subscription emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Newsletter email failed:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'This email is already subscribed' });
        }
        console.error('Database error in /api/newsletter:', err);
        res.status(500).json({ error: 'Failed to process subscription' });
    }
});

// =========================================================================
// CAREER SUBMISSION ENDPOINTS
// =========================================================================

app.post('/api/career', async (req, res) => {
    const { name, email, phone, position, experience, resume_url, cover_letter, message, resume } = req.body;
    
    if (!name || !email || !phone || !position) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    
    try {
        // Check for existing application for the same position
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const existingApplication = await CareerSubmission.findOne({
            email: email.toLowerCase(),
            position: position,
            createdAt: { $gte: oneMonthAgo }
        });

        if (existingApplication) {
            return res.status(409).json({ 
                error: `You have already applied for the position of ${position} recently. We will review your application and contact you soon.` 
            });
        }
        
        // Check for any recent application (within 24 hours)
        const oneDayAgoCheck = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingSubmission = await CareerSubmission.findOne({
            email,
            submitted_at: { $gte: oneDayAgoCheck }
        });
        
        if (existingSubmission) {
            return res.status(409).json({ error: 'You have already submitted an application recently. We will review it soon.' });
        }
        
        const submission = new CareerSubmission({
            name,
            email,
            phone,
            position,
            experience: experience || null,
            resume_url: resume_url || resume || null,
            cover_letter: cover_letter || message || null,
            status: 'pending'
        });
        
        await submission.save();
        
        try {
            const emailResults = await mailer.sendFormEmails('career', {
                name: name,
                email: email,
                phone: phone,
                position: position,
                experience: experience,
                resume_path: resume_url || resume,
                message: message || `Applied for: ${position}`,
                urgent: false
            });
            console.log('Career application emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Application submitted successfully', id: submission._id });
    } catch (err) {
        console.error('Career submission error:', err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// =========================================================================
// REAL ESTATE PROJECTS ENDPOINTS
// =========================================================================

app.get('/api/projects/search', async (req, res) => {
    try {
        const { 
            location, 
            bhk, 
            builder,
            minPrice,
            maxPrice,
            status,
            projectType,
            searchTerm 
        } = req.query;
        
        let query = {};
        
        if (location && location !== 'all') {
            query.location = new RegExp(location, 'i');
        }
        
        if (bhk && bhk !== 'all') {
            query.bhk = new RegExp(bhk, 'i');
        }
        
        if (builder && builder !== 'all') {
            query.builder_name = new RegExp(builder, 'i');
        }
        
        if (status && status !== 'all') {
            query.status_possession = status;
        }
        
        if (projectType && projectType !== 'all') {
            query.project_type = projectType;
        }
        
        if (searchTerm) {
            query.$or = [
                { project_name: new RegExp(searchTerm, 'i') },
                { builder_name: new RegExp(searchTerm, 'i') },
                { location: new RegExp(searchTerm, 'i') }
            ];
        }
        
        const results = await RealEstateProject.find(query).sort({ project_name: 1 });
        res.json(results);
        
    } catch (err) {
        console.error('Error searching projects:', err);
        res.status(500).json({ error: 'Failed to search projects' });
    }
});

app.get('/api/projects/locations', async (req, res) => {
    try {
        const locations = await RealEstateProject.distinct('location');
        res.json(locations.filter(loc => loc).sort());
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

app.get('/api/projects/builders', async (req, res) => {
    try {
        const builders = await RealEstateProject.distinct('builder_name');
        res.json(builders.filter(builder => builder).sort());
    } catch (err) {
        console.error('Error fetching builders:', err);
        res.status(500).json({ error: 'Failed to fetch builders' });
    }
});

// =========================================================================
// LOCATION INQUIRY ENDPOINTS
// =========================================================================

app.post('/api/location-inquiry', async (req, res) => {
    const { name, email, phone, location_name, property_type, budget, message } = req.body;
    
    if (!name || !email || !phone || !location_name) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    
    try {
        // Check for existing inquiry with same email/phone for this location (last 30 days)
        const existingInquiry = await LocationInquiry.findOne({
            $and: [
                { location_name },
                { $or: [
                    { email: email.toLowerCase() },
                    { phone: phone.replace(/\D/g, '') }
                ]}
            ],
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        if (existingInquiry) {
            return res.status(409).json({ 
                error: 'You have already submitted an inquiry for this location. Our team will contact you soon.' 
            });
        }
        
        // Check for any recent inquiry from this user (last 24 hours)
        const oneDayAgoCheck = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingInquiryCheck = await LocationInquiry.findOne({
            $or: [{ email }, { phone }],
            createdAt: { $gte: oneDayAgoCheck }
        });
        
        if (existingInquiryCheck) {
            return res.status(409).json({ error: 'You have already submitted an inquiry recently. We will contact you soon.' });
        }
        
        const inquiry = new LocationInquiry({
            name,
            email,
            phone,
            location_name,
            property_type: property_type || 'Any',
            budget: budget || 'Not specified',
            message: message || 'Interested in properties in ' + location_name
        });
        
        await inquiry.save();
        
        try {
            const emailResults = await mailer.sendFormEmails('location', {
                name: name,
                email: email,
                phone: phone,
                location_name: location_name,
                property_type: property_type,
                budget: budget,
                message: message || 'Location inquiry',
                urgent: false
            });
            console.log('Location inquiry emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Thank you for your interest! Our team will contact you soon.' });
    } catch (err) {
        console.error('Location inquiry error:', err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// =========================================================================
// BUILDER INQUIRY ENDPOINTS
// =========================================================================

app.post('/api/builder-inquiry', async (req, res) => {
    const { builder_name, name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !builder_name) {
        return res.status(400).json({ error: 'Name, email, phone, and builder name are required' });
    }
    
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await BuilderInquiry.findOne({
            $or: [{ email }, { phone }],
            createdAt: { $gte: oneDayAgo }
        });
        
        if (existing) {
            return res.status(409).json({ error: 'You have already submitted an inquiry recently. We will contact you soon.' });
        }
        
        const inquiry = new BuilderInquiry({
            builder_name,
            name,
            email,
            phone,
            message: message || 'General inquiry about projects'
        });
        
        await inquiry.save();
        
        try {
            const emailResults = await mailer.sendFormEmails('builder', {
                name: name,
                email: email,
                phone: phone,
                message: message || 'General inquiry about projects',
                builder_name: builder_name,
                urgent: false
            });
            console.log('Builder inquiry emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Builder inquiry submitted successfully', id: inquiry._id });
    } catch (err) {
        console.error('Database error in /api/builder-inquiry:', err);
        res.status(500).json({ error: 'Failed to submit builder inquiry' });
    }
});

// =========================================================================
// GENERAL INQUIRY ENDPOINT
// =========================================================================

app.post('/inquiry', async (req, res) => {
    const { name, email, phone, message, source } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await Inquiry.findOne({
            email,
            phone,
            received_at: { $gte: oneDayAgo }
        });
        
        if (existing) {
            return res.status(409).json({ error: 'You have already submitted an inquiry recently' });
        }
        
        const inquiry = new Inquiry({
            name,
            email,
            phone,
            message: message || '',
            source: source || 'Website Form'
        });
        
        await inquiry.save();
        
        try {
            const emailResults = await mailer.sendFormEmails('contact', {
                name: name,
                email: email,
                phone: phone,
                message: message || 'General inquiry',
                source: source || 'Website Form',
                urgent: false
            });
            console.log('Contact form emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Inquiry submitted successfully', id: inquiry._id });
    } catch (err) {
        console.error('Database error in /inquiry:', err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// =========================================================================
// ADMIN API: Inquiry Management
// =========================================================================

app.get('/admin/inquiries', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }

        if (startDate) {
            filter.received_at = filter.received_at || {};
            filter.received_at.$gte = new Date(startDate);
        }

        if (endDate) {
            filter.received_at = filter.received_at || {};
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.received_at.$lt = nextDay;
        }
        
        const inquiries = await Inquiry.find(filter).sort({ received_at: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

app.put('/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, message, source } = req.body;
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            id,
            { name, email, phone, message: message || null, source: source || 'Unknown' },
            { new: true }
        );
        
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
        res.json({ success: true, message: 'Inquiry updated successfully' });
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

app.delete('/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// API routes with /api/admin prefix
app.get('/api/admin/inquiries', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }

        if (startDate) {
            filter.createdAt = filter.createdAt || {};
            filter.createdAt.$gte = new Date(startDate);
        }

        if (endDate) {
            filter.createdAt = filter.createdAt || {};
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.createdAt.$lt = nextDay;
        }
        
        const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

app.put('/api/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, message, source } = req.body;
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            id,
            { name, email, phone, message: message || null, source: source || 'Unknown' },
            { new: true }
        );
        
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
        res.json({ success: true, message: 'Inquiry updated successfully' });
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

app.delete('/api/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// =========================================================================
// ADMIN API: Property Management
// =========================================================================

app.post('/api/admin/properties', authenticateToken, async (req, res) => {
    const { 
        project_name, 
        builder_name, 
        project_type, 
        min_price, 
        max_price, 
        size_sqft, 
        bhk, 
        status_possession, 
        location 
    } = req.body;
    
    if (!project_name || !builder_name || !project_type || !min_price || !max_price || !size_sqft || !bhk || !status_possession || !location) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        const existing = await RealEstateProject.findOne({
            project_name,
            builder_name,
            location
        });
        
        if (existing) {
            return res.status(409).json({ 
                error: 'Property already exists with the same name, builder, and location',
                duplicate: true 
            });
        }
        
        const property = new RealEstateProject({
            project_name,
            builder_name,
            project_type,
            min_price,
            max_price,
            size_sqft,
            bhk,
            status_possession,
            location
        });
        
        await property.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Property added successfully', 
            id: property._id 
        });
    } catch (err) {
        console.error('Error adding property:', err);
        res.status(500).json({ error: 'Failed to add property' });
    }
});

// =========================================================================
// ADMIN API: Newsletter Management
// =========================================================================

app.get('/api/admin/newsletter-subscriptions', authenticateToken, async (req, res) => {
    try {
        const subscriptions = await NewsletterSubscription.find().sort({ subscribed_at: -1 });
        res.json(subscriptions);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

app.delete('/api/admin/newsletter-subscriptions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const subscription = await NewsletterSubscription.findByIdAndDelete(id);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting subscription:', err);
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

// =========================================================================
// ADMIN API: Builder Inquiries Management
// =========================================================================

app.get('/api/admin/builder-inquiries', authenticateToken, async (req, res) => {
    try {
        const inquiries = await BuilderInquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error('Error fetching builder inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch builder inquiries' });
    }
});

app.delete('/api/admin/builder-inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const inquiry = await BuilderInquiry.findByIdAndDelete(id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// =========================================================================
// ADMIN API: Location Inquiries Management
// =========================================================================

app.get('/api/admin/location-inquiries', authenticateToken, async (req, res) => {
    try {
        const inquiries = await LocationInquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error('Error fetching location inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch location inquiries' });
    }
});

app.delete('/api/admin/location-inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const inquiry = await LocationInquiry.findByIdAndDelete(id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting location inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

app.put('/api/admin/location-inquiries/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        const inquiry = await LocationInquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        res.json(inquiry);
    } catch (err) {
        console.error('Error updating location inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

// =========================================================================
// ADMIN API: Career Submissions Management
// =========================================================================

app.get('/api/admin/career-submissions', authenticateToken, async (req, res) => {
    try {
        const submissions = await CareerSubmission.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching career submissions:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

app.put('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
        const submission = await CareerSubmission.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating submission:', err);
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

app.delete('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    try {
        const submission = await CareerSubmission.findByIdAndDelete(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting submission:', err);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// =========================================================================
// SERVER STARTUP
// =========================================================================

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 API endpoints ready`);
});

module.exports = app;
