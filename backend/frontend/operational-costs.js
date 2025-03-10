// Get the form element
const otherCostsForm = document.getElementById('operationalCostsForm');

// Constants for calculations
const BASE_SQUARE_FEET = 50000;
const BASE_HOURS = 10;

// Load saved operational costs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadOperationalCosts();
    addInputAnimations();
});

// Load operational costs from localStorage
function loadOperationalCosts() {
    const operationalCosts = JSON.parse(localStorage.getItem('operationalCosts')) || {
        dronePilot: 40,
        visualObserver: 25,
        opsManager: 45
    };

    // Fill the form with saved values
    document.getElementById('dronePilot').value = operationalCosts.dronePilot;
    document.getElementById('visualObserver').value = operationalCosts.visualObserver;
    document.getElementById('opsManager').value = operationalCosts.opsManager;
}

// Add animations to input fields
function addInputAnimations() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.closest('.cost-card').style.transform = 'translateY(-5px)';
            input.parentElement.closest('.cost-card').style.borderColor = 'rgba(0, 255, 255, 0.2)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.closest('.cost-card').style.transform = 'translateY(0)';
            input.parentElement.closest('.cost-card').style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
    });
}

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    // Add error styling if type is error
    if (type === 'error') {
        notification.style.background = 'rgba(255, 0, 0, 0.1)';
        notification.style.borderColor = 'rgba(255, 0, 0, 0.2)';
    }
    
    document.body.appendChild(notification);

    // Animate notification
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Validate input values
function validateInputs(values) {
    for (const [key, value] of Object.entries(values)) {
        if (isNaN(value) || value <= 0) {
            showNotification(`Invalid value for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please enter a positive number.`, 'error');
            return false;
        }
    }
    return true;
}

// Handle form submission
otherCostsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get values from form
    const operationalCosts = {
        dronePilot: parseFloat(document.getElementById('dronePilot').value),
        visualObserver: parseFloat(document.getElementById('visualObserver').value),
        opsManager: parseFloat(document.getElementById('opsManager').value),
        baseSquareFeet: BASE_SQUARE_FEET,
        baseHours: BASE_HOURS
    };

    // Validate inputs
    if (!validateInputs(operationalCosts)) {
        return;
    }

    try {
        // Save to localStorage
        localStorage.setItem('operationalCosts', JSON.stringify(operationalCosts));

        // Show success message
        showNotification('Operational costs have been saved successfully!');

        // Add button click animation
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.classList.add('button-click');
        setTimeout(() => submitButton.classList.remove('button-click'), 200);
    } catch (error) {
        console.error('Error saving operational costs:', error);
        showNotification('Failed to save operational costs. Please try again.', 'error');
    }
});

// Helper function to calculate operational costs for a given square footage
function calculateOperationalCosts(squareFeet) {
    const costs = JSON.parse(localStorage.getItem('operationalCosts'));
    const hours = (squareFeet / BASE_SQUARE_FEET) * BASE_HOURS;
    
    return {
        hours: hours,
        dronePilotCost: hours * costs.dronePilot,
        visualObserverCost: hours * costs.visualObserver,
        opsManagerCost: hours * costs.opsManager,
        totalCost: hours * (costs.dronePilot + costs.visualObserver + costs.opsManager)
    };
}