// frontend/user.js
document.addEventListener('DOMContentLoaded', function() {
    const userCountrySpan = document.getElementById('userCountry');

    if (userCountrySpan) {
        const country = localStorage.getItem('country');
        userCountrySpan.textContent = country;
    }
});
