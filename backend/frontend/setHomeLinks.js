// frontend/setHomeLinks.js

document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const backToHomeButton = document.getElementById('backToHome');
    
    if (backToHomeButton) {
        backToHomeButton.href = isAdmin ? 'admin.html' : 'user.html';
        
        // Add click event listener to clear data when navigating to home
        backToHomeButton.addEventListener('click', function(event) {
            clearCalculationData();
            // The default navigation will happen after this function
        });
    }
});

function clearCalculationData() {
    // Clear localStorage
    localStorage.removeItem('savedCalculation');
    localStorage.removeItem('calculationResults');

    // Reset global variables if any
    if (window.calculationResults) {
        window.calculationResults = null;
    }

    // Reset form inputs if on the pricing detail page
    const totalSqFtInput = document.getElementById('totalSqFt');
    if (totalSqFtInput) {
        totalSqFtInput.value = '';
    }

    const totalFloorsInput = document.getElementById('totalFloors');
    if (totalFloorsInput) {
        totalFloorsInput.value = '';
    }

    const discountTypeSelect = document.getElementById('discountType');
    if (discountTypeSelect) {
        discountTypeSelect.value = 'percentage';
    }

    const discountValueInput = document.getElementById('discountValue');
    if (discountValueInput) {
        discountValueInput.value = '';
    }

    // Uncheck radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });

    // Clear result display if on the pricing detail page
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
    }

    console.log('Calculation data cleared');
}
