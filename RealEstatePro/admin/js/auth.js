document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('login-status');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusMessage.textContent = '';
            
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                let result;
                
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    result = await response.json();
                } else {
                    // If not JSON, likely server is not running or returning HTML error
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Server error. Please ensure the server is running properly.');
                }

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Login failed');
                }
                
                showToaster(result.message, 'success');
                localStorage.setItem('adminToken', result.token);
                setTimeout(() => {
                    window.location.href = '/admin/dashboard.html';
                }, 1500);

            } catch (error) {
                statusMessage.textContent = error.message;
                showToaster(error.message, 'error');
            }
        });
    }
});

function showToaster(message, type) {
    const toaster = document.getElementById('toaster');
    toaster.textContent = message;
    toaster.className = `show ${type}`;
    setTimeout(() => {
        toaster.className = toaster.className.replace('show', '');
    }, 2000);
}

// Password Reset Functionality
document.getElementById('forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('reset-modal').style.display = 'block';
});

document.getElementById('cancel-reset').addEventListener('click', () => {
    document.getElementById('reset-modal').style.display = 'none';
    document.getElementById('reset-form').reset();
    document.getElementById('reset-status').textContent = '';
});

document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const newPassword = document.getElementById('new-password').value;
    const statusEl = document.getElementById('reset-status');
    
    try {
        const response = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        let result;
        
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            // If not JSON, likely an HTML error page
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned an invalid response. Please ensure the server is running.');
        }
        
        if (response.ok) {
            statusEl.style.color = 'green';
            statusEl.textContent = 'Password reset successfully! You can now login.';
            setTimeout(() => {
                document.getElementById('reset-modal').style.display = 'none';
                document.getElementById('reset-form').reset();
                statusEl.textContent = '';
            }, 2000);
        } else {
            statusEl.style.color = 'red';
            statusEl.textContent = result.error || 'Failed to reset password';
        }
    } catch (error) {
        statusEl.style.color = 'red';
        statusEl.textContent = 'Error: ' + error.message;
    }
});