const nodemailer = require('nodemailer');
const { getUserEmailTemplate, getCompanyEmailTemplate, getAdminEmailTemplate } = require('./email-templates');

// Create a reusable transporter object using the SMTP transport
// It reads the configuration from your .env file
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends email notifications to multiple recipients for form submissions
 * @param {string} formType - Type of form (contact, builder, career, newsletter)
 * @param {object} data - Form data including name, email, phone, message, etc.
 */
async function sendFormEmails(formType, data) {
    const results = {
        user: { sent: false, error: null },
        company: { sent: false, error: null },
        admin: { sent: false, error: null }
    };

    // Send email to USER (person who submitted the form)
    try {
        const userTemplate = getUserEmailTemplate(formType, data);
        const userInfo = await transporter.sendMail({
            from: `"BlueCrumbs" <${process.env.EMAIL_USER}>`,
            to: data.email,
            subject: userTemplate.subject,
            html: userTemplate.html
        });
        console.log("User email sent to %s: %s", data.email, userInfo.messageId);
        results.user.sent = true;
    } catch (error) {
        console.error("Error sending user email:", error.message);
        results.user.error = error.message;
    }

    // Send email to COMPANY
    try {
        const companyTemplate = getCompanyEmailTemplate(formType, data);
        const companyInfo = await transporter.sendMail({
            from: `"BlueCrumbs System" <${process.env.EMAIL_USER}>`,
            to: process.env.COMPANY_MAIL || 'bluecrumbsinfra@gmail.com',
            subject: companyTemplate.subject,
            html: companyTemplate.html
        });
        console.log("Company email sent to %s: %s", process.env.COMPANY_MAIL, companyInfo.messageId);
        results.company.sent = true;
    } catch (error) {
        console.error("Error sending company email:", error.message);
        results.company.error = error.message;
    }

    // Send email to ADMIN
    try {
        const adminTemplate = getAdminEmailTemplate(formType, data);
        const adminInfo = await transporter.sendMail({
            from: `"BlueCrumbs Admin Alert" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || 'ashutosh@admin.com',
            subject: adminTemplate.subject,
            html: adminTemplate.html
        });
        console.log("Admin email sent to %s: %s", process.env.ADMIN_EMAIL, adminInfo.messageId);
        results.admin.sent = true;
    } catch (error) {
        console.error("Error sending admin email:", error.message);
        results.admin.error = error.message;
    }

    return results;
}

/**
 * Legacy function for backward compatibility - redirects to new sendFormEmails
 * @deprecated Use sendFormEmails instead
 */
async function sendInquiryEmail(name, email, phone, message = 'General enquiry', source = 'General Enquiry', urgent = false) {
    const data = {
        name,
        email,
        phone,
        message,
        source,
        urgent
    };
    
    // Determine form type based on source
    let formType = 'contact';
    if (source.toLowerCase().includes('builder')) {
        formType = 'builder';
        // Extract builder name if present
        const builderMatch = source.match(/Builder Inquiry - (.+)/);
        if (builderMatch) {
            data.builder_name = builderMatch[1];
        }
    } else if (source.toLowerCase().includes('career')) {
        formType = 'career';
        data.position = message.replace('Applied for: ', '');
    } else if (source.toLowerCase().includes('newsletter')) {
        formType = 'newsletter';
    }
    
    return await sendFormEmails(formType, data);
}

/**
 * Generic sendMail function for sending emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version
 * @param {string} html - HTML version
 */
async function sendMail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"BlueCrumbs" <${process.env.VERIFIED_SENDER_EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        });
        console.log("Email sent successfully to %s: %s", to, info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email to %s:", to, error.message);
        throw error;
    }
}

module.exports = { sendInquiryEmail, sendMail, sendFormEmails };