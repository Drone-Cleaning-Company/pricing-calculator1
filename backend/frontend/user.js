document.addEventListener('DOMContentLoaded', function() {
    const userCountrySpan = document.getElementById('userCountry');
    const userNameSpan = document.getElementById('userName');
    const recentCalculationsContainer = document.getElementById('recentCalculations');

    if (userCountrySpan) {
        const country = localStorage.getItem('country');
        userCountrySpan.textContent = country;
    }

    if (userNameSpan) {
        const name = localStorage.getItem('name');
        userNameSpan.textContent = name;
    }

    function loadRecentCalculations() {
        const country = localStorage.getItem('country');
        console.log('Fetching calculations for country:', country);
        
        fetch(`/api/calculations/recent?country=${country}`)
            .then(response => response.json())
            .then(calculations => {
                console.log('Received calculations:', calculations);
                displayRecentCalculations(calculations);
            })
            .catch(error => {
                console.error('Error loading calculations:', error);
            });
    }

    function displayRecentCalculations(calculations) {
        const template = document.getElementById('calculationTemplate');
        if (!template) {
            console.error('Calculation template not found');
            return;
        }
        
        recentCalculationsContainer.innerHTML = ''; // Clear existing calculations

        calculations.forEach(calc => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.project-title').textContent = calc.name;
            clone.querySelector('.client-name').textContent = calc.name;
            clone.querySelector('.square-footage').textContent = calc.totalSqFt;
            clone.querySelector('.total-price').textContent = `$${calc.totalPrice.toFixed(2)}`;
            clone.querySelector('.cleaning-type').textContent = calc.cleaningType || 'N/A';
            recentCalculationsContainer.appendChild(clone);
        });
    }

    loadRecentCalculations();
});
