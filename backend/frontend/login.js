document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');

    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Login form submitted');

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            message.textContent = 'Please enter both username and password';
            message.style.color = '#ff0000';
            return;
        }

        try {
            console.log('Sending login request...');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Response received:', response.status);
            const data = await response.json();

            if (response.ok) {
                console.log('Login successful, storing data...');
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAdmin', data.user.isAdmin);
                localStorage.setItem('country', data.user.country);
                localStorage.setItem('name', data.user.name);
                localStorage.setItem('username', data.user.username);

                // Show success message
                message.textContent = 'Login successful! Redirecting...';
                message.style.color = '#00ff00';

                console.log('Redirecting based on role:', data.user.isAdmin ? 'admin' : 'user');
                
                // Redirect based on user role after a short delay
                setTimeout(() => {
                    window.location.href = data.user.isAdmin ? 'admin.html' : 'user.html';
                }, 1000);
            } else {
                console.log('Login failed:', data.message);
                
                // Check if this is a verification issue
                if (data.needsVerification) {
                    message.innerHTML = `${data.message} <a href="#" id="resendVerification" class="resend-link">Resend verification email</a>`;
                    message.style.color = '#ff9500';
                    
                    // Add event listener for resend link
                    document.getElementById('resendVerification').addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const resendResponse = await fetch('/api/auth/resend-verification', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email: data.email })
                            });
                            
                            const resendData = await resendResponse.json();
                            
                            if (resendResponse.ok) {
                                message.textContent = 'Verification email sent! Please check your inbox.';
                                message.style.color = '#4CAF50';
                            } else {
                                message.textContent = resendData.message || 'Failed to resend verification email.';
                                message.style.color = '#ff0000';
                            }
                        } catch (error) {
                            console.error('Error resending verification:', error);
                            message.textContent = 'An error occurred. Please try again.';
                            message.style.color = '#ff0000';
                        }
                    });
                } else {
                    // Regular error message
                    message.textContent = data.message || 'Login failed';
                    message.style.color = '#ff0000';
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            message.textContent = 'An error occurred during login. Please try again.';
            message.style.color = '#ff0000';
        }
    });
});
