// Get the form element
const otherCostsForm = document.getElementById('otherCostsForm');

// Constants for water filtration defaults
const DEFAULT_COST_PER_CUBIC_FOOT = 270;
const DEFAULT_GALLONS_PER_RESIN = 2500;

// Load saved other costs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadOtherCosts();
    addInputAnimations();
});

// Load other costs from localStorage
function loadOtherCosts() {
    const otherCosts = JSON.parse(localStorage.getItem('otherCosts')) || {
        miscellaneous: 500,
        fixedCosts: 661.56,
        solutionCosts: 100,
        waterFiltrationConstants: {
            costPerCubicFoot: DEFAULT_COST_PER_CUBIC_FOOT,
            gallonsPerResin: DEFAULT_GALLONS_PER_RESIN
        }
    };

    // Fill the form with saved values
    document.getElementById('miscellaneous').value = otherCosts.miscellaneous;
    document.getElementById('fixedCosts').value = otherCosts.fixedCosts;
    document.getElementById('solutionCosts').value = otherCosts.solutionCosts;
    document.getElementById('costPerCubicFoot').value = otherCosts.waterFiltrationConstants.costPerCubicFoot;
    document.getElementById('gallonsPerResin').value = otherCosts.waterFiltrationConstants.gallonsPerResin;
}

// Add animations to input fields
function addInputAnimations() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.closest('.cost-section').style.transform = 'translateY(-5px)';
            input.parentElement.closest('.cost-section').style.borderColor = 'rgba(0, 255, 255, 0.2)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.closest('.cost-section').style.transform = 'translateY(0)';
            input.parentElement.closest('.cost-section').style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
    // Validate general costs
    for (const [key, value] of Object.entries(values)) {
        if (key !== 'waterFiltrationConstants') {
            if (isNaN(value) || value < 0) {
                showNotification(`Invalid value for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please enter a non-negative number.`, 'error');
                return false;
            }
        }
    }

    // Validate water filtration constants
    const { costPerCubicFoot, gallonsPerResin } = values.waterFiltrationConstants;
    if (isNaN(costPerCubicFoot) || costPerCubicFoot <= 0) {
        showNotification('Cost per cubic foot must be greater than 0.', 'error');
        return false;
    }
    if (isNaN(gallonsPerResin) || gallonsPerResin <= 0) {
        showNotification('Gallons per resin must be greater than 0.', 'error');
        return false;
    }

    return true;
}

// Handle form submission
otherCostsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get values from form
    const otherCosts = {
        miscellaneous: parseFloat(document.getElementById('miscellaneous').value),
        fixedCosts: parseFloat(document.getElementById('fixedCosts').value),
        solutionCosts: parseFloat(document.getElementById('solutionCosts').value),
        waterFiltrationConstants: {
            costPerCubicFoot: parseFloat(document.getElementById('costPerCubicFoot').value),
            gallonsPerResin: parseFloat(document.getElementById('gallonsPerResin').value)
        }
    };

    // Validate inputs
    if (!validateInputs(otherCosts)) {
        return;
    }

    try {
        // Save to localStorage
        localStorage.setItem('otherCosts', JSON.stringify(otherCosts));

        // Show success message
        showNotification('Other costs have been saved successfully!');

        // Add button click animation
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.classList.add('button-click');
        setTimeout(() => submitButton.classList.remove('button-click'), 200);
    } catch (error) {
        console.error('Error saving other costs:', error);
        showNotification('Failed to save other costs. Please try again.', 'error');
    }
});