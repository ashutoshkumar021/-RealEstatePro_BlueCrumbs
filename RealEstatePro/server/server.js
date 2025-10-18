require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
const mailer = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());

// Add CORS headers for API routes only
app.use((req, res, next) => {
    // Only set JSON content type for API routes, not HTML files
    if (req.path.startsWith('/api/')) {
        res.header('Content-Type', 'application/json');
    }
    next();
});

// Serve static files with proper paths
const publicPath = path.join(__dirname, '..', 'public');
const adminPath = path.join(__dirname, '..', 'admin');

app.use(express.static(publicPath)); // Serve public folder
app.use('/admin', express.static(adminPath)); // Serve admin folder

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

// Admin Login
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const user = result[0][0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Check if user has a password set
        if (!user.password) {
            return res.status(401).json({ error: 'Password not set. Please reset your password.' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
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
        const result = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const user = result[0][0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Check if user has a password set
        if (!user.password) {
            return res.status(401).json({ error: 'Password not set. Please reset your password.' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
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
        // Check if admin exists
        const [admin] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (!admin || admin.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await db.query('UPDATE admins SET password = ? WHERE email = ?', [hashedPassword, email]);
        
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Newsletter subscription endpoint
app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
        // Check if already subscribed
        const [existing] = await db.query('SELECT id FROM newsletter_subscriptions WHERE email = ?', [email]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'Already subscribed' });
        }
        
        await db.query('INSERT INTO newsletter_subscriptions (email) VALUES (?)', [email]);
        res.json({ success: true, message: 'Successfully subscribed to newsletter' });
    } catch (err) {
        console.error('Newsletter subscription error:', err);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Career submission endpoint
app.post('/api/career', async (req, res) => {
    const { name, email, phone, position, experience, resume_url, cover_letter } = req.body;
    
    if (!name || !email || !phone || !position) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    
    try {
        await db.query(
            'INSERT INTO career_submissions (name, email, phone, position, experience, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, position, experience || null, resume_url || null, cover_letter || null, 'pending']
        );
        
        // Send confirmation email
        try {
            await mailer.sendMail(
                email,
                'Application Received - BlueCrumbs',
                `Dear ${name},\n\nThank you for applying for the ${position} position at BlueCrumbs. We have received your application and will review it shortly.\n\nBest regards,\nBlueCrumbs HR Team`,
                `<h2>Application Received</h2><p>Dear ${name},</p><p>Thank you for applying for the <strong>${position}</strong> position at BlueCrumbs.</p><p>We have received your application and will review it shortly.</p><p>Best regards,<br>BlueCrumbs HR Team</p>`
            );
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }
        
        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (err) {
        console.error('Career submission error:', err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Admin API endpoints (protected)
// Get newsletter subscriptions
app.get('/api/admin/newsletter-subscriptions', authenticateToken, async (req, res) => {
    try {
        const [subscriptions] = await db.query('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC');
        res.json(subscriptions);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Delete newsletter subscription
app.delete('/api/admin/newsletter-subscriptions/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM newsletter_subscriptions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting subscription:', err);
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

// Get builder inquiries
app.get('/api/admin/builder-inquiries', authenticateToken, async (req, res) => {
    try {
        const [inquiries] = await db.query('SELECT * FROM builder_inquiries ORDER BY created_at DESC');
        res.json(inquiries);
    } catch (err) {
        console.error('Error fetching builder inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// Delete builder inquiry
app.delete('/api/admin/builder-inquiries/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM builder_inquiries WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// Get career submissions
app.get('/api/admin/career-submissions', authenticateToken, async (req, res) => {
    try {
        const [submissions] = await db.query('SELECT * FROM career_submissions ORDER BY created_at DESC');
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching career submissions:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Update career submission status
app.put('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE career_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating submission:', err);
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

// Delete career submission
app.delete('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM career_submissions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting submission:', err);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// =========================================================================
// NEWSLETTER SUBSCRIPTION ENDPOINT (Simplified - Email Only)
// =========================================================================
app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Check if already subscribed
        const [existing] = await db.query(
            'SELECT id FROM newsletter_subscriptions WHERE email = ?',
            [email]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This email is already subscribed to our newsletter' });
        }
        
        // New subscription - just save email
        const result = await db.query(
            'INSERT INTO newsletter_subscriptions (email) VALUES (?)',
            [email]
        );
        
        // Send emails to user, company, and admin
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
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already subscribed' });
        }
        console.error('Database error in /api/newsletter:', err);
        res.status(500).json({ error: 'Failed to process subscription' });
    }
});

// =========================================================================
// REAL ESTATE PROJECTS SEARCH ENDPOINT
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
        
        let query = 'SELECT * FROM real_estate_projects WHERE 1=1';
        const params = [];
        
        // Location filter
        if (location && location !== 'all') {
            query += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }
        
        // BHK filter
        if (bhk && bhk !== 'all') {
            query += ' AND bhk LIKE ?';
            params.push(`%${bhk}%`);
        }
        
        // Builder filter
        if (builder && builder !== 'all') {
            query += ' AND builder_name LIKE ?';
            params.push(`%${builder}%`);
        }
        
        // Status filter
        if (status && status !== 'all') {
            query += ' AND status_possession = ?';
            params.push(status);
        }
        
        // Project type filter
        if (projectType && projectType !== 'all') {
            query += ' AND project_type = ?';
            params.push(projectType);
        }
        
        // General search term (searches in project name, builder name, and location)
        if (searchTerm) {
            query += ' AND (project_name LIKE ? OR builder_name LIKE ? OR location LIKE ?)';
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        
        // Price range filter (complex because prices are stored as strings with ₹ symbol)
        // This would need more complex handling in production
        
        query += ' ORDER BY project_name ASC';
        
        const [results] = await db.query(query, params);
        res.json(results);
        
    } catch (err) {
        console.error('Error searching projects:', err);
        res.status(500).json({ error: 'Failed to search projects' });
    }
});

// Get all unique locations for dropdown
app.get('/api/projects/locations', async (req, res) => {
    try {
        const [results] = await db.query('SELECT DISTINCT location FROM real_estate_projects WHERE location IS NOT NULL ORDER BY location');
        res.json(results.map(r => r.location));
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

// Get all unique builders for dropdown
app.get('/api/projects/builders', async (req, res) => {
    try {
        const [results] = await db.query('SELECT DISTINCT builder_name FROM real_estate_projects WHERE builder_name IS NOT NULL ORDER BY builder_name');
        res.json(results.map(r => r.builder_name));
    } catch (err) {
        console.error('Error fetching builders:', err);
        res.status(500).json({ error: 'Failed to fetch builders' });
    }
});

// =========================================================================
// BUILDER INQUIRIES ENDPOINT
// =========================================================================
app.post('/api/builder-inquiry', async (req, res) => {
    const { builder_name, name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !builder_name) {
        return res.status(400).json({ error: 'Name, email, phone, and builder name are required' });
    }
    
    try {
        // Check for duplicate submission (same email or phone in last 24 hours)
        const [existing] = await db.query(
            'SELECT id FROM builder_inquiries WHERE (email = ? OR phone = ?) AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
            [email, phone]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'You have already submitted an inquiry recently. We will contact you soon.' });
        }
        
        const finalMessage = message || 'General inquiry about projects';
        const result = await db.query(
            'INSERT INTO builder_inquiries (builder_name, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
            [builder_name, name, email, phone, finalMessage]
        );
        
        // Send emails to user, company, and admin
        try {
            const emailResults = await mailer.sendFormEmails('builder', {
                name: name,
                email: email,
                phone: phone,
                message: finalMessage,
                builder_name: builder_name,
                urgent: false
            });
            console.log('Builder inquiry emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
            // Continue even if email fails
        }
        
        res.status(201).json({ success: true, message: 'Builder inquiry submitted successfully', id: result[0].insertId });
    } catch (err) {
        console.error('Database error in /api/builder-inquiry:', err);
        res.status(500).json({ error: 'Failed to submit builder inquiry' });
    }
});

// =========================================================================
// GENERAL INQUIRY ENDPOINT (for form-handler.js)
// =========================================================================
app.post('/inquiry', async (req, res) => {
    const { name, email, phone, message, source } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate phone format (Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    try {
        // Check for duplicate inquiry
        const [existing] = await db.query(
            'SELECT id FROM inquiries WHERE email = ? AND phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
            [email, phone]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'You have already submitted an inquiry recently' });
        }
        
        // Insert new inquiry
        const [result] = await db.query(
            'INSERT INTO inquiries (name, email, phone, message, source, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [name, email, phone, message || '', source || 'Website Form']
        );
        
        // Send emails to user, company, and admin
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
            // Continue even if email fails
        }
        
        res.status(201).json({ success: true, message: 'Inquiry submitted successfully', id: result.insertId });
    } catch (err) {
        console.error('Database error in /inquiry:', err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// =========================================================================
// ADMIN API: Inquiry Management (FIXED: Source added to select)
// =========================================================================

// GET all inquiries
app.get('/admin/inquiries', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let filterConditions = [];

        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            filterConditions.push(
                `(LOWER(name) LIKE '${searchTerm}' OR LOWER(email) LIKE '${searchTerm}' OR phone LIKE '${searchTerm}')`
            );
        }

        if (startDate) {
            filterConditions.push(`received_at >= '${startDate}'`);
        }

        if (endDate) {
            // Add one day to endDate to include the whole day
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filterConditions.push(`received_at < '${nextDay.toISOString().split('T')[0]}'`);
        }
        
        const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : '';

        const queryText = `
            SELECT id, name, email, phone, message, source, received_at -- ✅ SOURCE SELECTED HERE
            FROM inquiries
            ${whereClause}
            ORDER BY received_at DESC
        `;
        
        const result = await db.query(queryText);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});


// UPDATE an inquiry (FIXED: Source updated)
app.put('/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, message, source } = req.body; // ✅ SOURCE ADDED HERE
    try {
        const result = await db.query(
            'UPDATE inquiries SET name = ?, email = ?, phone = ?, message = ?, source = ? WHERE id = ?',
            [name, email, phone, message || null, source || 'Unknown', id]
        );
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Inquiry not found' });
        res.json({ success: true, message: 'Inquiry updated successfully' });
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

// DELETE an inquiry
app.delete('/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM inquiries WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Inquiry not found' });
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// =========================================================================
// API ADMIN ROUTES (with /api/admin prefix for admin panel compatibility)
// =========================================================================

// GET all inquiries (API route)
app.get('/api/admin/inquiries', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let filterConditions = [];

        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            filterConditions.push(
                `(LOWER(name) LIKE '${searchTerm}' OR LOWER(email) LIKE '${searchTerm}' OR phone LIKE '${searchTerm}')`
            );
        }

        if (startDate) {
            filterConditions.push(`created_at >= '${startDate}'`);
        }

        if (endDate) {
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filterConditions.push(`created_at < '${nextDay.toISOString().split('T')[0]}'`);
        }
        
        const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : '';

        const queryText = `
            SELECT id, name, email, phone, message, source, 
                   created_at as received_at
            FROM inquiries
            ${whereClause}
            ORDER BY created_at DESC
        `;
        
        const result = await db.query(queryText);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// UPDATE an inquiry (API route)
app.put('/api/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, message, source } = req.body;
    try {
        const result = await db.query(
            'UPDATE inquiries SET name = ?, email = ?, phone = ?, message = ?, source = ? WHERE id = ?',
            [name, email, phone, message || null, source || 'Unknown', id]
        );
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Inquiry not found' });
        res.json({ success: true, message: 'Inquiry updated successfully' });
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

// DELETE an inquiry (API route)
app.delete('/api/admin/inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM inquiries WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Inquiry not found' });
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// =========================================================================
// ADD PROPERTY ENDPOINT
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
        // Check for duplicate property
        const [existing] = await db.query(
            `SELECT id FROM real_estate_projects 
             WHERE project_name = ? AND builder_name = ? AND location = ?`,
            [project_name, builder_name, location]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({ 
                error: 'Property already exists with the same name, builder, and location',
                duplicate: true 
            });
        }
        
        // Insert new property
        const result = await db.query(
            `INSERT INTO real_estate_projects 
            (project_name, builder_name, project_type, min_price, max_price, size_sqft, bhk, status_possession, location) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [project_name, builder_name, project_type, min_price, max_price, size_sqft, bhk, status_possession, location]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Property added successfully', 
            id: result[0].insertId 
        });
    } catch (err) {
        console.error('Error adding property:', err);
        res.status(500).json({ error: 'Failed to add property' });
    }
});

// =========================================================================
// CAREER SUBMISSIONS ENDPOINT
// =========================================================================

// POST career submission
app.post('/api/career', async (req, res) => {
    const { name, email, phone, position, resume, message, experience, cover_letter } = req.body;
    
    if (!name || !email || !phone || !position) {
        return res.status(400).json({ error: 'Name, email, phone, and position are required' });
    }
    
    try {
        // Check for duplicate submission (same email in last 24 hours)
        const [existing] = await db.query(
            'SELECT id FROM career_submissions WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
            [email]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'You have already submitted an application recently. We will review it soon.' });
        }
        
        const result = await db.query(
            'INSERT INTO career_submissions (name, email, phone, position, experience, resume, cover_letter, message, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [name, email, phone, position, experience || null, resume || null, cover_letter || null, message || null, 'pending']
        );
        
        // Send emails to user, company, and admin
        try {
            const emailResults = await mailer.sendFormEmails('career', {
                name: name,
                email: email,
                phone: phone,
                position: position,
                experience: experience,
                resume_path: resume,
                message: message || `Applied for: ${position}`,
                urgent: false
            });
            console.log('Career application emails sent:', emailResults);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
        }
        
        res.status(201).json({ success: true, message: 'Application submitted successfully', id: result[0].insertId });
    } catch (err) {
        console.error('Database error in /api/career:', err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// =========================================================================
// NEWSLETTER SUBSCRIPTIONS (Admin Routes)
// =========================================================================

// GET all newsletter subscriptions
app.get('/api/admin/newsletter-subscriptions', authenticateToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC';
        const [result] = await db.query(query);
        res.json(result);
    } catch (err) {
        console.error('Error fetching newsletter subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// DELETE newsletter subscription
app.delete('/api/admin/newsletter-subscriptions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM newsletter_subscriptions WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting subscription:', err);
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

// =========================================================================
// BUILDER INQUIRIES (Admin Routes)
// =========================================================================

// GET all builder inquiries
app.get('/api/admin/builder-inquiries', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM builder_inquiries 
            ORDER BY created_at DESC
        `);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching builder inquiries:', err);
        res.status(500).json({ error: 'Failed to fetch builder inquiries' });
    }
});

// DELETE builder inquiry
app.delete('/api/admin/builder-inquiries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM builder_inquiries WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting builder inquiry:', err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// =========================================================================
// ADD PROPERTY (Admin Route)
// =========================================================================

// Removed duplicate endpoint - using /api/admin/properties instead

// =========================================================================
// CAREER SUBMISSIONS (Admin Routes)
// =========================================================================

// GET all career submissions
app.get('/api/admin/career-submissions', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, email, phone, position, experience, resume, 
                   cover_letter, message, status, submitted_at, created_at
            FROM career_submissions
            ORDER BY submitted_at DESC, created_at DESC
        `);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching career submissions:', err);
        res.status(500).json({ error: 'Failed to fetch career submissions' });
    }
});

// UPDATE career submission status
app.put('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'reviewed', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
        const result = await db.query(
            'UPDATE career_submissions SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.error('Error updating career submission:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE career submission
app.delete('/api/admin/career-submissions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM career_submissions WHERE id = ?', [id]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting career submission:', err);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// Catch-all route for API endpoints that don't exist
app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Public website: http://localhost:${PORT}/`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/login.html`);
});