// frontend/setHomeLinks.js
document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const backToHomeButton = document.getElementById('backToHome');

    if (backToHomeButton) {
        backToHomeButton.href = isAdmin ? 'admin.html' : 'user.html';
    }
});
