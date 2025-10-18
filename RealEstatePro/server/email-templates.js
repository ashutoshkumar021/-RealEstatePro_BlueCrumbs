// Email Templates for different recipients and forms

/**
 * Get email template for USER (person who submitted the form)
 */
function getUserEmailTemplate(formType, data) {
    const templates = {
        'contact': {
            subject: 'Thank you for contacting BlueCrumbs Real Estate',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0d2c54 0%, #1a4d8f 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">BlueCrumbs Real Estate</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fb;">
                        <h2 style="color: #0d2c54;">Dear ${data.name},</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for reaching out to us. We have received your inquiry and our team will get back to you within 24-48 hours.
                        </p>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Your Inquiry Details:</h3>
                            <p style="color: #6b7280;"><strong>Message:</strong> ${data.message || 'General inquiry'}</p>
                            <p style="color: #6b7280;"><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Meanwhile, feel free to explore our latest properties on our website or contact us directly at:
                        </p>
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li>Phone: +91 9999999999</li>
                            <li>Email: info@bluecrumbsinfra.com</li>
                        </ul>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                Best Regards,<br>
                                <strong>BlueCrumbs Real Estate Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        'builder': {
            subject: `Thank you for your interest in ${data.builder_name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0d2c54 0%, #1a4d8f 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">BlueCrumbs Real Estate</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fb;">
                        <h2 style="color: #0d2c54;">Dear ${data.name},</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for your interest in <strong>${data.builder_name}</strong> properties. We have received your inquiry and our property specialist will contact you shortly with detailed information.
                        </p>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Your Inquiry Details:</h3>
                            <p style="color: #6b7280;"><strong>Builder:</strong> ${data.builder_name}</p>
                            <p style="color: #6b7280;"><strong>Project:</strong> ${data.project || 'All Projects'}</p>
                            <p style="color: #6b7280;"><strong>Message:</strong> ${data.message || 'Interested in properties'}</p>
                            <p style="color: #6b7280;"><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Our expert will provide you with:
                        </p>
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li>Detailed project information</li>
                            <li>Current pricing and offers</li>
                            <li>Site visit arrangement</li>
                            <li>Payment plans and financing options</li>
                        </ul>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #856404; margin: 0;">
                                <strong>Note:</strong> One of our property consultants will call you within 24 hours.
                            </p>
                        </div>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                Best Regards,<br>
                                <strong>BlueCrumbs Real Estate Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        'career': {
            subject: 'Application Received - BlueCrumbs Real Estate',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0d2c54 0%, #1a4d8f 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">BlueCrumbs Real Estate</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fb;">
                        <h2 style="color: #0d2c54;">Dear ${data.name},</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for applying for the position of <strong>${data.position}</strong> at BlueCrumbs Real Estate. We have successfully received your application.
                        </p>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Application Details:</h3>
                            <p style="color: #6b7280;"><strong>Position Applied:</strong> ${data.position}</p>
                            <p style="color: #6b7280;"><strong>Application Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="color: #4b5563; line-height: 1.6;">
                            <strong>What happens next?</strong>
                        </p>
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li>Our HR team will review your application</li>
                            <li>If your profile matches our requirements, we will contact you for further discussion</li>
                            <li>The review process typically takes 5-7 business days</li>
                        </ul>
                        <p style="color: #4b5563; line-height: 1.6;">
                            We appreciate your interest in joining our team and will keep you updated on the status of your application.
                        </p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                Best Regards,<br>
                                <strong>BlueCrumbs HR Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        'newsletter': {
            subject: 'Welcome to BlueCrumbs Newsletter',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0d2c54 0%, #1a4d8f 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">BlueCrumbs Real Estate</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fb;">
                        <h2 style="color: #0d2c54;">Welcome to Our Newsletter!</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for subscribing to the BlueCrumbs Real Estate newsletter. You're now part of our exclusive community!
                        </p>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0d2c54; margin-top: 0;">What to Expect:</h3>
                            <ul style="color: #6b7280; line-height: 1.8;">
                                <li>Latest property listings and exclusive deals</li>
                                <li>Market trends and investment insights</li>
                                <li>Tips for buyers and sellers</li>
                                <li>New project launches and pre-launch offers</li>
                            </ul>
                        </div>
                        <p style="color: #4b5563; line-height: 1.6;">
                            We send newsletters twice a month with valuable content curated just for you.
                        </p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                You can unsubscribe at any time by clicking the unsubscribe link in our emails.<br><br>
                                <strong>BlueCrumbs Real Estate Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        }
    };

    return templates[formType] || templates['contact'];
}

/**
 * Get email template for COMPANY (internal notification)
 */
function getCompanyEmailTemplate(formType, data) {
    const urgencyBadge = data.urgent ? '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">URGENT</span>' : '';
    
    const templates = {
        'contact': {
            subject: `New Contact Form Submission from ${data.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0d2c54; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0;">New Contact Form Submission ${urgencyBadge}</h2>
                    </div>
                    <div style="padding: 20px; background: #f8f9fb;">
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Contact Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Name:</strong></td>
                                    <td style="padding: 8px 0; color: #4b5563;">${data.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                                    <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #f7b801;">${data.email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
                                    <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #f7b801;">${data.phone}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Source:</strong></td>
                                    <td style="padding: 8px 0; color: #4b5563;">${data.source || 'Website Form'}</td>
                                </tr>
                            </table>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Message</h3>
                            <p style="color: #4b5563; line-height: 1.6; background: #f8f9fb; padding: 15px; border-left: 4px solid #f7b801;">
                                ${data.message || 'No message provided'}
                            </p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
                            </p>
                        </div>
                        <div style="margin-top: 20px; color: #6b7280; font-size: 12px; text-align: center;">
                            <p>Submitted on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `
        },
        'builder': {
            subject: `Builder Inquiry: ${data.builder_name} - ${data.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0d2c54; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0;">New Builder Inquiry ${urgencyBadge}</h2>
                    </div>
                    <div style="padding: 20px; background: #f8f9fb;">
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #2e7d32; margin: 0;">Builder: ${data.builder_name}</h3>
                            ${data.project ? `<p style="color: #388e3c; margin: 5px 0 0 0;">Project: ${data.project}</p>` : ''}
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Lead Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Name:</strong></td>
                                    <td style="padding: 8px 0; color: #4b5563;">${data.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                                    <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #f7b801;">${data.email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
                                    <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #f7b801;">${data.phone}</a></td>
                                </tr>
                            </table>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Inquiry Details</h3>
                            <p style="color: #4b5563; line-height: 1.6; background: #f8f9fb; padding: 15px; border-left: 4px solid #f7b801;">
                                ${data.message || 'Interested in this builder\'s properties'}
                            </p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>High Priority Lead:</strong> Builder inquiries have high conversion rates. Contact within 2 hours for best results.
                            </p>
                        </div>
                        <div style="margin-top: 20px; color: #6b7280; font-size: 12px; text-align: center;">
                            <p>Submitted on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `
        },
        'career': {
            subject: `New Job Application: ${data.position} - ${data.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0d2c54; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0;">New Job Application</h2>
                    </div>
                    <div style="padding: 20px; background: #f8f9fb;">
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #1565c0; margin: 0;">Position: ${data.position}</h3>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Applicant Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Name:</strong></td>
                                    <td style="padding: 8px 0; color: #4b5563;">${data.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                                    <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #f7b801;">${data.email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
                                    <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #f7b801;">${data.phone}</a></td>
                                </tr>
                            </table>
                        </div>
                        ${data.resume_path ? `
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Resume</h3>
                            <p style="color: #4b5563;">Resume has been uploaded and saved to the server.</p>
                            <p style="color: #6b7280; font-size: 14px;">Path: ${data.resume_path}</p>
                        </div>
                        ` : ''}
                        <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                            <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                                <strong>HR Action:</strong> Please review this application and update the candidate within 5-7 business days.
                            </p>
                        </div>
                        <div style="margin-top: 20px; color: #6b7280; font-size: 12px; text-align: center;">
                            <p>Application received on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `
        },
        'newsletter': {
            subject: `New Newsletter Subscription: ${data.email}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0d2c54; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0;">New Newsletter Subscription</h2>
                    </div>
                    <div style="padding: 20px; background: #f8f9fb;">
                        <div style="background: #fff; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #0d2c54; margin-top: 0;">Subscriber Details</h3>
                            <p style="color: #4b5563;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #f7b801;">${data.email}</a></p>
                            <p style="color: #4b5563;"><strong>Subscribed on:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                            <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                                <strong>Note:</strong> Subscriber has been added to the mailing list and will receive future newsletters.
                            </p>
                        </div>
                    </div>
                </div>
            `
        }
    };

    return templates[formType] || templates['contact'];
}

/**
 * Get email template for ADMIN
 */
function getAdminEmailTemplate(formType, data) {
    // Admin gets a more detailed version similar to company but with additional admin controls
    const template = getCompanyEmailTemplate(formType, data);
    
    // Add admin-specific footer
    const adminFooter = `
        <div style="margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h4 style="color: #374151; margin-top: 0;">Admin Actions</h4>
            <p style="color: #6b7280; font-size: 14px;">
                • Log into the admin panel to view full details<br>
                • Assign this lead to a sales representative<br>
                • Update lead status and add notes<br>
                • Generate reports for this inquiry type
            </p>
        </div>
    `;
    
    // Insert admin footer before closing divs
    template.html = template.html.replace('</div>\n</div>\n</div>', adminFooter + '</div>\n</div>\n</div>');
    template.subject = '[ADMIN] ' + template.subject;
    
    return template;
}

module.exports = {
    getUserEmailTemplate,
    getCompanyEmailTemplate,
    getAdminEmailTemplate
};
