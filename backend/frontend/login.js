document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAdmin', data.isAdmin);
                localStorage.setItem('country', data.country);
                localStorage.setItem('name', data.name); // Store the name

                // Redirect based on user role
                if (data.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'user.html';
                }
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.textContent = error.message || 'An error occurred during login.';
        }
    });
});
