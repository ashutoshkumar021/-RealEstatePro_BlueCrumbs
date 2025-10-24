/**
 * Form Handler - Common form validation and submission logic
 * Handles all enquiry forms across the website
 */

(function() {
    'use strict';

    // Toast notification function
    function showToast(message, isError = false) {
        const toaster = document.getElementById('toaster');
        if (!toaster) return;
        
        // Clear any existing timer
        if (toaster.timeoutId) {
            clearTimeout(toaster.timeoutId);
        }
        
        toaster.textContent = message;
        toaster.className = 'toaster show ' + (isError ? 'error' : 'success');
        
        // Auto-hide after 2 seconds
        toaster.timeoutId = setTimeout(() => {
            toaster.classList.remove('show', 'error', 'success');
            toaster.className = 'toaster'; // Reset to base class
        }, 2000);
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (Indian format)
    function isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    // Name validation
    function isValidName(name) {
        return name.trim().length >= 2;
    }

    // Form validation
    function validateForm(formData) {
        const errors = [];

        if (!formData.name || !isValidName(formData.name)) {
            errors.push('Please enter a valid name (minimum 2 characters)');
        }

        if (!formData.email || !isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!formData.phone || !isValidPhone(formData.phone)) {
            errors.push('Please enter a valid 10-digit mobile number');
        }

        return errors;
    }

    // Submit form data to server
    async function submitFormData(formData) {
        try {
            const response = await fetch('/inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.error || 'Failed to submit enquiry' };
            }
        } catch (error) {
            console.error('Submission Error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    // Handle form submission
    async function handleFormSubmit(form, e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            name: form.querySelector('[name="name"]')?.value.trim() || '',
            email: form.querySelector('[name="email"]')?.value.trim() || '',
            phone: form.querySelector('[name="phone"]')?.value.trim() || '',
            message: form.querySelector('[name="message"]')?.value.trim() || '',
            source: form.querySelector('[name="source"]')?.value || 'Website Form'
        };

        // Validate form
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showToast(errors[0], true);
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        // Submit form
        const result = await submitFormData(formData);

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (result.success) {
            showToast('Thank you for your enquiry! We will contact you soon.');
            form.reset();
            
            // Close popup if it's a popup form
            const popup = form.closest('.enquiry-popup');
            if (popup) {
                closeEnquiryPopup();
            }
        } else {
            showToast(result.error, true);
        }
    }

    // Open enquiry popup
    function openEnquiryPopup() {
        const popup = document.getElementById('quick-enquiry-popup');
        if (popup) {
            popup.setAttribute('aria-hidden', 'false');
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close enquiry popup
    function closeEnquiryPopup() {
        const popup = document.getElementById('quick-enquiry-popup');
        if (popup) {
            popup.setAttribute('aria-hidden', 'true');
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Initialize all forms
    function initializeForms() {
        // Initialize all enquiry forms (but skip builder forms as they have their own handlers)
        const forms = document.querySelectorAll('form[id*="inquiry"], form[id*="enquiry"], form[id*="contact"]');
        forms.forEach(form => {
            // Skip builder forms and main popup forms as they have their own handlers
            if (form.id === 'builder-enquiry-form' || 
                form.id === 'popup-inquiry-form' || 
                form.id === 'main-popup-enquiry-form') {
                return;
            }
            form.addEventListener('submit', (e) => handleFormSubmit(form, e));
        });

        // Initialize floating enquiry button
        const floatingBtn = document.getElementById('floating-enquiry-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', openEnquiryPopup);
        }

        // Initialize close popup button
        const closeBtn = document.getElementById('close-popup-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeEnquiryPopup);
        }

        // Close popup when clicking outside
        const popup = document.getElementById('quick-enquiry-popup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    closeEnquiryPopup();
                }
            });
        }

        // Add real-time validation
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.setCustomValidity('Please enter a valid email address');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });
        });

        document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidPhone(this.value)) {
                    this.setCustomValidity('Please enter a valid 10-digit mobile number');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });

            // Only allow numbers
            input.addEventListener('keypress', function(e) {
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });

            // Limit to 10 digits
            input.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 10);
            });
        });

        document.querySelectorAll('input[name="name"]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidName(this.value)) {
                    this.setCustomValidity('Please enter a valid name (minimum 2 characters)');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForms);
    } else {
        initializeForms();
    }

    // Also initialize after a short delay to catch dynamically loaded content
    setTimeout(initializeForms, 1000);

    // Expose functions globally if needed
    window.FormHandler = {
        showToast,
        openEnquiryPopup,
        closeEnquiryPopup,
        initializeForms
    };
})();
