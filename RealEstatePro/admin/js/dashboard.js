document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // --- Element Selectors ---
    const logoutButton = document.getElementById('logout-button');
    const tableBody = document.getElementById('inquiries-table-body');
    const searchInput = document.getElementById('search-input');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterButton = document.getElementById('filter-button');
    const clearFilterButton = document.getElementById('clear-filter-button');
    
    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    
    // Delete Modal Elements
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete-button');

    // Generic Cancel Buttons for all modals
    document.querySelectorAll('.cancel-modal-button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    // --- Tab Navigation ---
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const topbarTitle = document.querySelector('.topbar-title h2');
    const topbarDesc = document.querySelector('.topbar-title p');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Mobile navigation
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.dataset.tab;
            switchTab(tabName);
            // Close mobile menu
            document.querySelector('.mobile-nav').classList.remove('active');
            document.querySelector('.mobile-nav-overlay').classList.remove('active');
        });
    });
    
    function switchTab(tabName) {
        // Update active menu item
        menuItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Hide all tabs
        tabContents.forEach(tab => tab.style.display = 'none');
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // Update title
        const titles = {
            'inquiries': { title: 'Inquiries Dashboard', desc: 'View and manage recent property inquiries.' },
            'newsletter': { title: 'Newsletter Subscribers', desc: 'Manage newsletter subscriptions.' },
            'builder': { title: 'Builder Inquiries', desc: 'View builder-specific inquiries.' },
            'career': { title: 'Career Submissions', desc: 'Manage job applications.' },
            'projects': { title: 'Add Property', desc: 'Add new real estate projects to database.' }
        };
        
        topbarTitle.textContent = titles[tabName].title;
        topbarDesc.textContent = titles[tabName].desc;
        
        // Load data for the tab
        switch(tabName) {
            case 'inquiries':
                fetchInquiries();
                break;
            case 'newsletter':
                fetchNewsletterSubscribers();
                break;
            case 'builder':
                fetchBuilderInquiries();
                break;
            case 'career':
                fetchCareerSubmissions();
                break;
        }
    }

    // --- Initial Data Fetch ---
    fetchInquiries();

    // --- Event Listeners ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    });

    filterButton.addEventListener('click', () => fetchInquiries());
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') fetchInquiries();
    });

    clearFilterButton.addEventListener('click', () => {
        searchInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        fetchInquiries();
    });

    // Event delegation for Edit and Delete buttons in the table
    tableBody.addEventListener('click', (event) => {
        const actionButton = event.target.closest('.btn-action');
        if (!actionButton) return;

        const inquiryId = actionButton.dataset.id;
        if (actionButton.classList.contains('edit')) {
            handleEdit(inquiryId, actionButton.closest('tr'));
        } else if (actionButton.classList.contains('delete')) {
            openDeleteConfirmation(inquiryId);
        } else if (actionButton.classList.contains('view')) {
            // Handle view logic if implemented elsewhere, currently does nothing
        }
    });
    
    // Edit Form submission
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-inquiry-id').value;
        const updatedInquiry = {
            name: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
        };
        await updateInquiry(id, updatedInquiry);
    });

    // --- Main Functions ---

    async function fetchInquiries() {
        const spinner = document.getElementById('loading-spinner');
        spinner.style.display = 'block';
        tableBody.innerHTML = '';
        
        const filters = {
            search: searchInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };

        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        try {
            const inquiries = await api.getInquiries(filters);
            renderTable(inquiries);
            updateInquiryStats(inquiries);
        } catch (error) {
            console.error(error);
            showToaster(`Error: ${error.message}`, 'error');
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${error.message}</td></tr>`;
        } finally {
            spinner.style.display = 'none';
        }
    }
    
    function updateInquiryStats(inquiries) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;
        
        inquiries.forEach(inquiry => {
            const date = new Date(inquiry.received_at || inquiry.created_at);
            if (date >= today) todayCount++;
            if (date >= weekAgo) weekCount++;
            if (date >= monthAgo) monthCount++;
        });
        
        document.getElementById('total-inquiries').textContent = inquiries.length;
        document.getElementById('today-inquiries').textContent = todayCount;
        document.getElementById('week-inquiries').textContent = weekCount;
        document.getElementById('month-inquiries').textContent = monthCount;
    }

    function renderTable(inquiries) {
        if (inquiries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No inquiries found.</td></tr>';
            return;
        }
        tableBody.innerHTML = inquiries.map(inquiry => `
            <tr class="${inquiry.urgent ? 'urgent-row' : ''}">
                <td data-label="Name">
                    ${inquiry.name}
                    ${inquiry.urgent ? '<span class="urgent-badge">URGENT</span>' : ''}
                </td>
                <td data-label="Email">${inquiry.email}</td>
                <td data-label="Phone">${inquiry.phone}</td>
                <td data-label="Source">${inquiry.source || 'General'}</td>
                <td data-label="Message">${inquiry.message ? inquiry.message.substring(0, 50) + (inquiry.message.length > 50 ? '...' : '') : 'General enquiry'}</td>
                <td data-label="Date">${new Date(inquiry.received_at || inquiry.timestamp || inquiry.created_at).toLocaleString()}</td>
                <td data-label="Actions" class="actions-cell">
                    <button class="btn-action view" data-id="${inquiry.id}" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" data-id="${inquiry.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" data-id="${inquiry.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function openDeleteConfirmation(id) {
        confirmDeleteButton.dataset.id = id;
        deleteModal.style.display = 'flex';
        
        // Remove previous listeners before adding a new one
        confirmDeleteButton.removeEventListener('click', performDelete);
        confirmDeleteButton.addEventListener('click', performDelete);
    }

    async function performDelete() {
        const id = confirmDeleteButton.dataset.id;
        try {
            // Use api.js for delete
            const result = await api.deleteInquiry(id);
            
            showToaster(result.message || 'Inquiry deleted successfully.', 'success');
            fetchInquiries();
        } catch (error) {
            showToaster(error.message, 'error');
        } finally {
            deleteModal.style.display = 'none';
        }
    }
    
    function handleEdit(id, tableRow) {
        const name = tableRow.cells[0].innerText.replace('URGENT', '').trim(); // Clean up badge text
        const email = tableRow.cells[1].innerText;
        const phone = tableRow.cells[2].innerText;
        document.getElementById('edit-inquiry-id').value = id;
        document.getElementById('edit-name').value = name;
        document.getElementById('edit-email').value = email;
        document.getElementById('edit-phone').value = phone;
        editModal.style.display = 'flex';
    }

    async function updateInquiry(id, data) {
        try {
            // Use api.js for update
            const result = await api.updateInquiry(id, data);
            
            showToaster(result.message || 'Inquiry updated successfully.', 'success');
            editModal.style.display = 'none';
            fetchInquiries();
        } catch (error) {
            showToaster(error.message, 'error');
        }
    }

    function showToaster(message, type = 'success') {
        const toaster = document.getElementById('toaster');
        toaster.textContent = message;
        toaster.className = `show ${type}`;
        setTimeout(() => { toaster.className = toaster.className.replace('show', ''); }, 3000);
    }
    
    // --- Newsletter Functions ---
    async function fetchNewsletterSubscribers() {
        try {
            const response = await fetch('/api/admin/newsletter-subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const subscribers = await response.json();
            
            const tbody = document.getElementById('newsletter-table-body');
            if (subscribers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No subscribers yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = subscribers.map(sub => `
                <tr>
                    <td>${sub.email}</td>
                    <td>${new Date(sub.subscribed_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action delete" onclick="deleteSubscriber(${sub.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            showToaster('Error loading subscribers', 'error');
        }
    }
    
    // Copy all emails function
    document.getElementById('copy-all-emails').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/admin/newsletter-subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const subscribers = await response.json();
            const emails = subscribers.map(s => s.email).join(', ');
            
            navigator.clipboard.writeText(emails);
            showToaster(`Copied ${subscribers.length} email(s) to clipboard!`, 'success');
        } catch (error) {
            showToaster('Error copying emails', 'error');
        }
    });
    
    window.deleteSubscriber = async function(id) {
        if (!confirm('Delete this subscriber?')) return;
        
        try {
            await fetch(`/api/admin/newsletter-subscriptions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToaster('Subscriber deleted', 'success');
            fetchNewsletterSubscribers();
        } catch (error) {
            showToaster('Error deleting subscriber', 'error');
        }
    }
    
    // --- Builder Inquiries Functions ---
    async function fetchBuilderInquiries() {
        try {
            const response = await fetch('/api/admin/builder-inquiries', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const inquiries = await response.json();
            
            const tbody = document.getElementById('builder-table-body');
            if (inquiries.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">No builder inquiries yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = inquiries.map(inq => `
                <tr>
                    <td>${inq.builder_name}</td>
                    <td>${inq.name}</td>
                    <td>${inq.email}</td>
                    <td>${inq.phone}</td>
                    <td>${inq.message || 'N/A'}</td>
                    <td>${new Date(inq.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action delete" onclick="deleteBuilderInquiry(${inq.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            showToaster('Error loading builder inquiries', 'error');
        }
    }
    
    window.deleteBuilderInquiry = async function(id) {
        if (!confirm('Delete this inquiry?')) return;
        
        try {
            await fetch(`/api/admin/builder-inquiries/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToaster('Inquiry deleted', 'success');
            fetchBuilderInquiries();
        } catch (error) {
            showToaster('Error deleting inquiry', 'error');
        }
    }
    
    // --- Career Submissions Functions ---
    async function fetchCareerSubmissions() {
        try {
            const response = await fetch('/api/admin/career-submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const submissions = await response.json();
            
            const tbody = document.getElementById('career-table-body');
            if (submissions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8">No career submissions yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = submissions.map(sub => `
                <tr>
                    <td>${sub.name}</td>
                    <td>${sub.email}</td>
                    <td>${sub.phone}</td>
                    <td>${sub.position}</td>
                    <td>${sub.experience || 'N/A'}</td>
                    <td>
                        <select onchange="updateCareerStatus(${sub.id}, this.value)">
                            <option value="pending" ${sub.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewed" ${sub.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                            <option value="rejected" ${sub.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </td>
                    <td>${new Date(sub.submitted_at || sub.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action delete" onclick="deleteCareerSubmission(${sub.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            showToaster('Error loading career submissions', 'error');
        }
    }
    
    window.updateCareerStatus = async function(id, status) {
        try {
            await fetch(`/api/admin/career-submissions/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            showToaster('Status updated', 'success');
        } catch (error) {
            showToaster('Error updating status', 'error');
        }
    }
    
    window.updateCareerStatus = async function(id, status) {
        try {
            await fetch(`/api/admin/career-submissions/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            showToaster('Status updated', 'success');
        } catch (error) {
            showToaster('Error updating status', 'error');
        }
    }
    
    // Add Property Form Submission
    const addPropertyForm = document.getElementById('add-property-form');
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                project_name: addPropertyForm.project_name.value,
                builder_name: addPropertyForm.builder_name.value,
                project_type: addPropertyForm.project_type.value,
                min_price: addPropertyForm.min_price.value,
                max_price: addPropertyForm.max_price.value,
                size_sqft: addPropertyForm.size_sqft.value,
                bhk: addPropertyForm.bhk.value,
                status_possession: addPropertyForm.status_possession.value,
                location: addPropertyForm.location.value
            };
            
            try {
                const response = await fetch('/api/admin/properties', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showToaster('Property added successfully!', 'success');
                    addPropertyForm.reset();
                    
                    // Update recent properties list
                    const recentList = document.getElementById('recent-properties-list');
                    if (recentList) {
                        const propertyItem = `
                            <div style="padding: 10px; margin: 10px 0; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                                <strong>${formData.project_name}</strong> by ${formData.builder_name}<br>
                                <small>📍 ${formData.location} | 💰 ${formData.min_price} - ${formData.max_price}</small>
                            </div>
                        `;
                        if (recentList.textContent.includes('No properties')) {
                            recentList.innerHTML = propertyItem;
                        } else {
                            recentList.innerHTML = propertyItem + recentList.innerHTML;
                        }
                    }
                } else if (response.status === 409) {
                    // Handle duplicate property
                    showToaster('⚠️ This property already exists with the same name, builder, and location', 'warning');
                    
                    // Highlight duplicate fields
                    addPropertyForm.project_name.style.borderColor = '#ffc107';
                    addPropertyForm.builder_name.style.borderColor = '#ffc107';
                    addPropertyForm.location.style.borderColor = '#ffc107';
                    
                    setTimeout(() => {
                        addPropertyForm.project_name.style.borderColor = '';
                        addPropertyForm.builder_name.style.borderColor = '';
                        addPropertyForm.location.style.borderColor = '';
                    }, 3000);
                } else {
                    showToaster(result.error || 'Failed to add property', 'error');
                }
            } catch (error) {
                showToaster('Error adding property: ' + error.message, 'error');
            }
        });
    }
    
    window.deleteCareerSubmission = async function(id) {
        if (!confirm('Delete this submission?')) return;
        
        try {
            await fetch(`/api/admin/career-submissions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToaster('Submission deleted', 'success');
            fetchCareerSubmissions();
        } catch (error) {
            showToaster('Error deleting submission', 'error');
        }
    }
    
    // --- Add Property Form --- (Removed duplicate event listener)
});