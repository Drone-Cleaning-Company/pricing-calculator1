// frontend/logout.js
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear the token from localStorage
            localStorage.removeItem('token');

            // Redirect to the login page (index.html)
            window.location.href = '/index.html';
        });
    }
});
