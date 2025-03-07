// Get the form element
const otherCostsForm = document.getElementById('otherCostsForm');

// Constants for water filtration defaults
const DEFAULT_COST_PER_CUBIC_FOOT = 270;
const DEFAULT_GALLONS_PER_RESIN = 2500;

// Load saved other costs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadOtherCosts();
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
    
    
    // Fill water filtration constants
    document.getElementById('costPerCubicFoot').value = otherCosts.waterFiltrationConstants.costPerCubicFoot;
    document.getElementById('gallonsPerResin').value = otherCosts.waterFiltrationConstants.gallonsPerResin;
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

    // Validate the data
    if (!validateWaterFiltrationData(otherCosts.waterFiltrationConstants)) {
        return;
    }

    // Save to localStorage
    localStorage.setItem('otherCosts', JSON.stringify(otherCosts));

    // Show success message
    alert('Other costs have been saved successfully!');
});

// Validate water filtration data
function validateWaterFiltrationData(data) {
    if (data.gallonsPerResin <= 0) {
        alert('Gallons per resin must be greater than 0');
        return false;
    }
    if (data.costPerCubicFoot <= 0) {
        alert('Cost per cubic foot must be greater than 0');
        return false;
    }
    return true;
}