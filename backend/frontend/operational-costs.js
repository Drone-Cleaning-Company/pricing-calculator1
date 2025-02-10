// Get the form element
const form = document.getElementById('operationalCostsForm');

// Constants for calculations
const BASE_SQUARE_FEET = 50000;
const BASE_HOURS = 10;

// Load saved operational costs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadOperationalCosts();
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

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get values from form
    const operationalCosts = {
        dronePilot: parseFloat(document.getElementById('dronePilot').value),
        visualObserver: parseFloat(document.getElementById('visualObserver').value),
        opsManager: parseFloat(document.getElementById('opsManager').value),
        baseSquareFeet: BASE_SQUARE_FEET,
        baseHours: BASE_HOURS
    };

    // Save to localStorage
    localStorage.setItem('operationalCosts', JSON.stringify(operationalCosts));

    // Show success message
    alert('Operational costs have been saved successfully!');
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