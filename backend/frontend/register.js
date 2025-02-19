document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const message = document.getElementById('message');

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const country = document.getElementById('country').value;
        const adminKey = document.getElementById('adminKey').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, username, password, country, adminKey })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                window.location.href = 'frontend/index.html'; // Redirect to login page
            } else {
                message.textContent = data.message;
            }
        } catch (error) {
            console.error('Error registering:', error);
            message.textContent = 'An error occurred during registration.';
        }
    });
});
