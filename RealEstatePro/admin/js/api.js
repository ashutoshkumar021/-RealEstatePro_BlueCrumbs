// API Service for handling all backend communications
class ApiService {
    constructor() {
        this.baseUrl = '/api/admin';
    }

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('adminToken');
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const mergedOptions = { 
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        };
        // Remove 'Content-Type' if explicitly setting a custom one (e.g., for file upload)
        if (options.body && typeof options.body !== 'string' && !(options.body instanceof URLSearchParams)) {
             delete mergedOptions.headers['Content-Type'];
        }

        const response = await fetch(url, { ...mergedOptions, credentials: 'include' });
        
        if (!response.ok) {
            // Basic unauthorized check
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                // Redirect only if not already on the login page (to prevent loops)
                if (window.location.pathname !== '/admin/login.html') {
                    window.location.href = '/admin/login.html';
                }
            }
            try {
                const error = await response.json();
                throw new Error(error.message || `API call failed with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
        }

        return response.json();
    }

    // Career Submissions
    async getCareerSubmissions(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/career-submissions?${query}`);
    }

    async updateSubmissionStatus(id, status, notes = '') {
        return this.request(`/career-submissions/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes })
        });
    }
    
    // Inquiries
    async getInquiries(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/inquiries?${query}`);
    }

    async updateInquiry(id, data) {
        return this.request(`/inquiries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteInquiry(id) {
        return this.request(`/inquiries/${id}`, {
            method: 'DELETE',
        });
    }

    // Generic Download function (can be improved but matching previous logic)
    async downloadResume(id) {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${this.baseUrl}/career-submissions/${id}/resume`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to download resume');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Create a singleton instance
const api = new ApiService();