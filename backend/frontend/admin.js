document.addEventListener('DOMContentLoaded', function() {
    const userCountrySpan = document.getElementById('userCountry');
    const userNameSpan = document.getElementById('userName');

    if (userCountrySpan) {
        const country = localStorage.getItem('country');
        userCountrySpan.textContent = country;
    }

    if (userNameSpan) {
        const name = localStorage.getItem('name');
        userNameSpan.textContent = name;
    }
});
