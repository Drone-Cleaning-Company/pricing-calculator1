document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initializeFormElements();
    initializeEventListeners();
    initializeTooltips();
    restoreSavedCalculation();
    restoreClientInfo();

    // Add animation classes for smooth transitions
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('fade-in');
    });

    // Retrieve parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const totalSqFt = parseFloat(urlParams.get('sqft') || localStorage.getItem('totalSqFt') || 0);
    const totalFloors = parseInt(urlParams.get('totalFloors') || localStorage.getItem('totalFloors') || 0);

    // Set total square footage and floors in the readonly input fields
    const totalSqFtInput = document.getElementById('totalSqFt');
    const totalFloorsInput = document.getElementById('totalFloors');
    
    if (totalSqFtInput) {
        totalSqFtInput.value = totalSqFt.toFixed(2);
    }
    
    if (totalFloorsInput) {
        totalFloorsInput.value = totalFloors;
    }

    // Calculate floor distribution
    calculateFloorDistribution();

    // Retrieve address from URL
    const address = decodeURIComponent(urlParams.get('address') || '');
    
    // Set address in the readonly input field
    const addressInput = document.getElementById('address');
    if (addressInput) {
        addressInput.value = address;
    }

    // Function to calculate floor distribution
    function calculateFloorDistribution() {
        // Validate inputs
        if (isNaN(totalSqFt) || totalSqFt <= 0) {
            console.error('Invalid total square footage.');
            return;
        }
        if (totalFloors <= 0) {
            console.error('Total floors must be greater than zero.');
            return;
        }

        // Calculate square footage per floor
        const sqFtPerFloor = totalSqFt / totalFloors;

        // Update the read-only fields
        document.getElementById('sqFtPerFloor').value = sqFtPerFloor.toFixed(2);

        // Distribute floors into low, mid, and high rise categories
        const lowRiseFloors = Math.min(totalFloors, 5);
        const midRiseFloors = Math.max(0, Math.min(totalFloors - 5, 5));
        const highRiseFloors = Math.max(0, totalFloors - 10);

        // Update floor counts
        document.getElementById('lowRiseFloors').value = lowRiseFloors;
        document.getElementById('midRiseFloors').value = midRiseFloors;
        document.getElementById('highRiseFloors').value = highRiseFloors;

        // Calculate square footage for each category
        const lowRiseSqFt = sqFtPerFloor * lowRiseFloors;
        const midRiseSqFt = sqFtPerFloor * midRiseFloors;
        const highRiseSqFt = sqFtPerFloor * highRiseFloors;

        // Update square footage fields
        document.getElementById('lowRiseSqFt').value = lowRiseSqFt.toFixed(2);
        document.getElementById('midRiseSqFt').value = midRiseSqFt.toFixed(2);
        document.getElementById('highRiseSqFt').value = highRiseSqFt.toFixed(2);
    }

    // Style readonly input fields for clarity
    document.querySelectorAll('.readonly-input').forEach(input => {
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        input.style.color = 'rgba(255, 255, 255, 0.7)';
    });
});

function initializeFormElements() {
    // Set up readonly inputs with proper styling
    document.querySelectorAll('.readonly-input').forEach(input => {
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        input.style.color = 'rgba(255, 255, 255, 0.7)';
    });

    // Initialize toggle sections with animation
    const sections = [
        { button: 'toggleFloorDistribution', section: 'floorDistributionSection' },
        { button: 'toggleSquareFootageByRise', section: 'squareFootageByRiseSection' }
    ];

    sections.forEach(({ button, section }) => {
        const btn = document.getElementById(button);
        const sect = document.getElementById(section);
        if (btn && sect) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isHidden = sect.style.display === 'none' || sect.style.display === '';
                
                // Rotate icon
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    icon.style.transition = 'transform 0.3s ease';
                }

                // Toggle section with animation
                if (isHidden) {
                    sect.style.display = 'block';
                    sect.style.opacity = '0';
                    setTimeout(() => {
                        sect.style.opacity = '1';
                        sect.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    sect.style.opacity = '0';
                    sect.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        sect.style.display = 'none';
                    }, 300);
                }
            });
        }
    });
}

function initializeEventListeners() {
    // Calculate button event
    const calculateButton = document.getElementById('calculatePriceButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            calculateButton.classList.add('button-click');
            setTimeout(() => calculateButton.classList.remove('button-click'), 200);
            calculateFinalPrice();
        });
    }

    // Discount type change event
    const discountType = document.getElementById('discountType');
    const discountValueSection = document.getElementById('discountValueSection');
    if (discountType && discountValueSection) {
        discountType.addEventListener('change', () => {
            const showSection = discountType.value !== 'none';
            if (showSection) {
                discountValueSection.style.display = 'block';
                discountValueSection.style.opacity = '0';
                setTimeout(() => {
                    discountValueSection.style.opacity = '1';
                    discountValueSection.style.transform = 'translateY(0)';
                }, 10);
            } else {
                discountValueSection.style.opacity = '0';
                discountValueSection.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    discountValueSection.style.display = 'none';
                }, 300);
            }
        });
    }

    // Save button event
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveButton.classList.add('button-click');
            setTimeout(() => saveButton.classList.remove('button-click'), 200);
            saveCalculation();
        });
    }
}

function initializeTooltips() {
    // Add tooltips to important elements
    const tooltips = {
        'totalSqFt': 'Total square footage calculated from previous step',
        'complexityCost': 'Additional cost based on building complexity',
        'travelCost': 'Cost of travel to the location',
        'discountValue': 'Enter discount amount or percentage'
    };

    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.setAttribute('data-tooltip', text);
            tooltip.innerHTML = '?';
            element.parentNode.appendChild(tooltip);
        }
    });
}

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

// Add this CSS to the page
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .button-click {
        transform: scale(0.95);
        transition: transform 0.2s ease;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.2);
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        backdrop-filter: blur(10px);
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification i {
        color: #0ff;
    }

    .tooltip {
        position: relative;
        display: inline-block;
        width: 16px;
        height: 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        text-align: center;
        line-height: 16px;
        font-size: 12px;
        cursor: help;
        margin-left: 0.5rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .tooltip:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 100%;
        margin-bottom: 5px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const pnlButton = document.getElementById('showPnLPage'); // Adjust the ID as necessary
    
    if (pnlButton) {
        if (!isAdmin) {
            pnlButton.style.display = 'none';
        } else {
            pnlButton.addEventListener('click', showPnLPage);
        }
    }
});

function calculateSimpleWaterCosts(squareFeet) {
    try {
        const otherCosts = JSON.parse(localStorage.getItem('otherCosts'));
        if (!otherCosts?.waterFiltrationConstants) {
            throw new Error("Water filtration constants not found");
        }

        // Constants for calculation
        const SQFT_PER_GALLON = 12.5; // Square feet cleaned per gallon
        const { costPerCubicFoot, gallonsPerResin } = otherCosts.waterFiltrationConstants;

        // Calculate water needs
        const gallonsNeeded = squareFeet / SQFT_PER_GALLON;
        const resinRequired = gallonsNeeded / gallonsPerResin;
        const totalWaterCost = resinRequired * costPerCubicFoot;

        return {
            gallonsNeeded: Math.round(gallonsNeeded),
            resinRequired: Number(resinRequired.toFixed(3)),
            totalWaterCost: Math.round(totalWaterCost * 100) / 100
        };
    } catch (error) {
        console.error("Water cost calculation error:", error);
        return null;
    }
}

// Calculate operational hours based on cleaning rate
function calculateOperationalHours(squareFeet) {
    const SQFT_PER_MINUTE = 50;
    const SQFT_PER_HOUR = SQFT_PER_MINUTE * 60; // 3000 sq ft per hour
    const SETUP_HOURS = 3; // Additional setup & prep time

    const cleaningHours = squareFeet / SQFT_PER_HOUR;
    const totalHours = cleaningHours + SETUP_HOURS;
    const totalDays = totalHours / 10; // Assuming 10-hour workday

    return {
        squareFeet: squareFeet,
        sqFtPerMinute: SQFT_PER_MINUTE,
        sqFtPerHour: SQFT_PER_HOUR,
        cleaningHours: cleaningHours,
        setupHours: SETUP_HOURS,
        totalHours: totalHours,
        totalDays: totalDays
    };
}

// Calculate operational costs based on hours
function calculateOperationalCosts(squareFeet) {
    // Get saved operational costs or use defaults
    const operationalCosts = JSON.parse(localStorage.getItem('operationalCosts')) || {
        dronePilot: 40,
        visualObserver: 25,
        opsManager: 45
    };

    // Calculate hours and timing details
    const timeCalc = calculateOperationalHours(squareFeet);

    // Calculate costs for each role based on total hours
    const dronePilotCost = (timeCalc.totalHours+2) * operationalCosts.dronePilot;
    const voCost = (timeCalc.totalHours+2) * operationalCosts.visualObserver;
    const opsManagerCost = (timeCalc.totalHours+2) * operationalCosts.opsManager;

    return {
        ...timeCalc,
        dronePilot: operationalCosts.dronePilot,
        visualObserver: operationalCosts.visualObserver,
        opsManager: operationalCosts.opsManager,
        dronePilotCost,
        voCost,
        opsManagerCost,
        totalOperationalCost: dronePilotCost + voCost + opsManagerCost
    };
}

// Function to calculate square footage distribution by floor type
function calculateFloorDistribution(totalSqFt, lowRiseFloors, midRiseFloors, highRiseFloors) {
    // Calculate square footage per floor
    const sqFtPerFloor = totalSqFt / (lowRiseFloors + midRiseFloors + highRiseFloors);

    // Calculate square footage for each rise category
    const lowRiseSqFt = sqFtPerFloor * lowRiseFloors;
    const midRiseSqFt = sqFtPerFloor * midRiseFloors;
    const highRiseSqFt = sqFtPerFloor * highRiseFloors;

    // Update the read-only fields
    document.getElementById('sqFtPerFloor').value = sqFtPerFloor.toFixed(2);
    document.getElementById('lowRiseFloors').value = lowRiseFloors;
    document.getElementById('midRiseFloors').value = midRiseFloors;
    document.getElementById('highRiseFloors').value = highRiseFloors;

    document.getElementById('lowRiseSqFt').value = lowRiseSqFt.toFixed(2);
    document.getElementById('midRiseSqFt').value = midRiseSqFt.toFixed(2);
    document.getElementById('highRiseSqFt').value = highRiseSqFt.toFixed(2);
}

// Add this function to calculate discount
function calculateDiscount(subtotal, discountType, discountValue) {
    let discountAmount = 0;

    if (discountType === 'percentage') {
        if (discountValue < 0 || discountValue > 100) {
            throw new Error("Percentage discount must be between 0 and 100.");
        }
        discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
        if (discountValue < 0 || discountValue > subtotal) {
            throw new Error("Fixed discount must be positive and less than or equal to the subtotal.");
        }
        discountAmount = discountValue;
    } else {
        throw new Error("Invalid discount type. Please select 'percentage' or 'fixed'.");
    }

    return discountAmount;
}

/// Modified applyDiscount function
function applyDiscount() {
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value);
    const errorElement = document.getElementById('discountError');

    // Clear any previous error messages
    errorElement.style.display = 'none';
    errorElement.textContent = '';

    try {
        // Basic validation before recalculating
        if (discountType !== 'none' && (isNaN(discountValue) || discountValue < 0)) {
            throw new Error('Please enter a valid discount value');
        }
        
        // Recalculate the final price
        calculateFinalPrice();
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

function calculateFinalPrice() {
    const urlParams = new URLSearchParams(window.location.search);

    // Retrieve inputs
    const totalSqFt = parseFloat(document.getElementById('totalSqFt').value) || 0;
    let totalFloors = parseInt(urlParams.get('totalFloors')) || 0;
    const frequency = document.querySelector('input[name="frequency"]:checked')?.value;
    const heightCategory = document.querySelector('input[name="heightCategory"]:checked')?.value;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    if (totalFloors === 0) {
        totalFloors = parseInt(localStorage.getItem('totalFloors')) || 0;
    }
    const complexityCost = parseFloat(document.getElementById('complexityCost').value) || 0;
    const travelCost = parseFloat(document.getElementById('travelCost').value) || 0;
    console.log('Total Floors:', totalFloors); 
    // Validate inputs
    if (!frequency ||  totalSqFt <= 0) {
        showNotification('Please fill out all fields correctly.', 'error');
        return;
    }

    console.log(`Total Floors: ${totalFloors}`);
    console.log(`Total SqFt: ${totalSqFt}`);

    // Calculate square footage per floor
    const sqFtPerFloor = totalSqFt / totalFloors;

    // Floor categorization
    const lowRiseFloors = Math.min(totalFloors, 5); // First 5 floors are low-rise
    const midRiseFloors = Math.min(Math.max(totalFloors - 5, 0), 5); // Next 5 floors are mid-rise
    const highRiseFloors = Math.max(totalFloors - 10, 0); // Remaining floors are high-rise

    console.log(`Low Rise Floors: ${lowRiseFloors}, Mid Rise Floors: ${midRiseFloors}, High Rise Floors: ${highRiseFloors}`);

    // Get multipliers from localStorage
    const operationalCosts = JSON.parse(localStorage.getItem('operationalCosts')) || {
        lowRiseMultiplier: 0.1,
        midRiseMultiplier: 0.25,
        highRiseMultiplier: 0.4
    };

    // Calculate prices for each category
    const lowRisePrice = lowRiseFloors * sqFtPerFloor * operationalCosts.lowRiseMultiplier;
    const midRisePrice = midRiseFloors * sqFtPerFloor * operationalCosts.midRiseMultiplier;
    const highRisePrice = highRiseFloors * sqFtPerFloor * operationalCosts.highRiseMultiplier;

    console.log(`Low Rise Price: ${lowRisePrice}, Mid Rise Price: ${midRisePrice}, High Rise Price: ${highRisePrice}`);

    // Calculate operational costs
    const operationalCostsCalc = calculateOperationalCosts(totalSqFt);
    if (!operationalCostsCalc) {
        console.error("Operational costs calculation failed.");
        return;
    }

    console.log(`Operational Costs:`, operationalCostsCalc);

    // Calculate water costs
    const waterCosts = calculateSimpleWaterCosts(totalSqFt);
    if (!waterCosts) {
        alert("Water costs calculation failed. Please check water filtration settings on the Other Costs page.");
        return;
    }

    console.log(`Water Costs:`, waterCosts);

    // Get other costs from localStorage with validation
    const otherCosts = JSON.parse(localStorage.getItem('otherCosts'));
    if (!otherCosts) {
        alert("Other costs data not found. Please configure costs on the Other Costs page.");
        return;
    }

    console.log(`Other Costs:`, otherCosts);

    // Calculate other costs subtotal
    const otherCostSubtotal =
        otherCosts.miscellaneous +
        otherCosts.fixedCosts +
        otherCosts.solutionCosts

    console.log(`Other Costs Subtotal: ${otherCostSubtotal}`);

    // Calculate base subtotal
    const baseSubtotal =
        lowRisePrice +
        midRisePrice +
        highRisePrice +
        waterCosts.totalWaterCost +
        otherCostSubtotal+
        complexityCost + travelCost;

    console.log(`Base Subtotal: ${baseSubtotal}`);

    // Apply frequency multiplier
    const frequencyMultiplier = {
        annually: 1,
        'semi-annually': 1.5,
        quarterly: 2,
        monthly: 12,
    }[frequency];

    if (!frequencyMultiplier) {
        alert("Invalid frequency selected.");
        return;
    }

    console.log(`Frequency Multiplier: ${frequencyMultiplier}`);

    const subtotal = baseSubtotal * frequencyMultiplier;

    console.log(`Subtotal After Frequency Multiplier: ${subtotal}`);

    // Calculate discount
    let discountAmount = 0;
    try {
        if (discountType !== 'none' && !isNaN(discountValue)) {
            discountAmount = calculateDiscount(subtotal, discountType, discountValue);
            console.log(`Discount Amount: ${discountAmount}`);
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return;
    }

    // Calculate final total price after discount
    const totalPrice = subtotal - discountAmount;

    console.log(`Total Price After Discount: ${totalPrice}`);

    // Display result
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    resultDiv.innerHTML = `
        <h3>Service Price Breakdown</h3>
        <table border="1" cellspacing="0" cellpadding="10">
            <tr>
                <th>Category</th>
                <th>Square Footage</th>
                <th>Price per Sq Ft</th>
                <th>Total Price</th>
            </tr>
            <tr>
                <td>Low Rise (1-5 Floors)</td>
                <td>${(lowRiseFloors * sqFtPerFloor).toFixed(2)} sq ft</td>
                <td>$0.10</td>
                <td>$${lowRisePrice.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Mid Rise (6-10 Floors)</td>
                <td>${(midRiseFloors * sqFtPerFloor).toFixed(2)} sq ft</td>
                <td>$0.25</td>
                <td>$${midRisePrice.toFixed(2)}</td>
            </tr>
            <tr>
                <td>High Rise (11+ Floors)</td>
                <td>${(highRiseFloors * sqFtPerFloor).toFixed(2)} sq ft</td>
                <td>$0.40</td>
                <td>$${highRisePrice.toFixed(2)}</td>
            </tr>
        </table>

        <h3>Operational Costs</h3>
        <table border="1" cellspacing="0" cellpadding="10">
            <tr>
                <td>Total Square Footage</td>
                <td>${totalSqFt.toFixed(0)} sq ft</td>
            </tr>
            <tr>
                <td>Square Feet Cleaned Per Hour</td>
                <td>${operationalCostsCalc.sqFtPerHour.toFixed(0)} sq ft</td>
            </tr>
            <tr>
                <td>Cleaning Hours</td>
                <td>${operationalCostsCalc.cleaningHours.toFixed(1)} hours</td>
            </tr>
            <tr>
                <td>Additional Time Required (hrs)</td>
                <td>${operationalCostsCalc.setupHours} hours</td>
            </tr>
            <tr>
                <td>Total Time</td>
                <td>${operationalCostsCalc.totalHours.toFixed(1)} hours</td>
            </tr>
            <tr>
                <td>Total Days</td>
                <td>${operationalCostsCalc.totalDays.toFixed(2)} days</td>
            </tr>
        </table>
       
        <button type="button" class="toggle-button" onclick="toggleLaborCosts()" style="margin: 1rem 0;">
            <i class="fas fa-users"></i>
            Labor Costs
        </button>
        <div id="laborCostsSection" style="display: none; margin-top: 10px;">
         <table border="1" cellspacing="0" cellpadding="10">
             <tr>
                 <td>Drone Pilot</td>
                 <td>$${operationalCostsCalc.dronePilotCost.toFixed(2)}</td>
              </tr>
               <tr>
                  <td>Visual Observer</td>
                 <td>$${operationalCostsCalc.voCost.toFixed(2)}</td>
                </tr>
             <tr>
                  <td>Operations Manager</td>
                  <td>$${operationalCostsCalc.opsManagerCost.toFixed(2)}</td>
              </tr>
              <tr>
                 <td><strong>Total Labor Costs</strong></td>
                    <td><strong>$${operationalCostsCalc.totalOperationalCost.toFixed(2)}</strong></td>
               </tr>
          </table>
        </div>

        <h4>Final Price Breakdown</h4>
        <table border="1" cellspacing="0" cellpadding="10">
            <tr>
                <td>Base Service Price</td>
                <td>$${(lowRisePrice + midRisePrice + highRisePrice).toFixed(2)}</td>
            </tr>
           <tr>
         <td>Additional Cost</td>
          <td>$${(otherCostSubtotal + waterCosts.totalWaterCost).toFixed(2)}</td>
        </tr>

            <tr>
                <td><strong>Subtotal</strong></td>
                <td><strong>$${subtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td>Discount (${discountType === 'percentage' ? discountValue + '%' : 'Fixed'})</td>
                <td>-$${discountAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Total Price</strong></td>
                <td><strong>$${totalPrice.toFixed(2)}</strong></td>
            </tr>
        </table>
    `;
    const results = {
        inputs: {
            totalSqFt,
            totalFloors,
            frequency,
            heightCategory,
            discountType,
            discountValue
        },
        pricing: {
            lowRise: {
                squareFootage: lowRiseFloors * sqFtPerFloor,
                pricePerSqFt: 0.1,
                totalPrice: lowRisePrice
            },
            midRise: {
                squareFootage: midRiseFloors * sqFtPerFloor,
                pricePerSqFt: 0.25,
                totalPrice: midRisePrice
            },
            highRise: {
                squareFootage: highRiseFloors * sqFtPerFloor,
                pricePerSqFt: 0.4,
                totalPrice: highRisePrice
            }
        },
        operationalCosts: {
            ...operationalCostsCalc
        },
        waterCosts: {
            totalWaterCost: waterCosts.totalWaterCost
        },
        otherCosts: {
            miscellaneous: otherCosts.miscellaneous || 0,
            fixedCosts: otherCosts.fixedCosts || 0,
            waterFiltration: otherCosts.waterFiltration || 0,
            solutionCosts: otherCosts.solutionCosts || 0,
            travelCharge: otherCosts.travelCharge || 0,
            otherCostSubtotal: otherCostSubtotal
        },
        totals: {
            baseServicePrice: lowRisePrice + midRisePrice + highRisePrice,
            solutionCost: 100,
            otherCostSubtotal,
            subtotal,
            discountAmount,
            totalPrice
        }
     };
     
     // Make results globally available
     window.calculationResults = results;
     return results;

};

// Function to store client info before navigating to P&L
function storeClientInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = decodeURIComponent(urlParams.get('clientName')) || localStorage.getItem('clientName');
    const address = decodeURIComponent(urlParams.get('address')) || localStorage.getItem('address');
    const totalSqFt = urlParams.get('sqft') || localStorage.getItem('totalSqFt');

    localStorage.setItem('clientName', name);
    localStorage.setItem('address', address);
    localStorage.setItem('totalSqFt', totalSqFt);
}

    // showPnLPage.js
    function showPnLPage() {
         // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
   
    if (!isAdmin) {
        alert('Access denied. Only administrators can view the P&L page.');
        return; // Exit the function if not an admin
    }
    storeClientInfo();
        try {
            console.log('Getting values from calculation results...');
    
            // Access the globally available calculation results
            const results = window.calculationResults;
    
            if (!results) {
                throw new Error('Calculation results not found. Please calculate the final price first.');
            }
    
            // Extract the total price
            const totalPrice = results.totals.totalPrice;
            console.log('Total Price:', totalPrice);
    
            // Extract the labor costs (operational costs)
            const laborCosts = results.operationalCosts.totalOperationalCost || 0;
            console.log('Labor Costs:', laborCosts);
    
            // Extract the other costs and water costs
            const otherCosts = results.otherCosts.otherCostSubtotal || 0;
            const waterCosts = results.waterCosts.totalWaterCost || 0;
    
            // Calculate Additional Cost
            const additionalCost = otherCosts + waterCosts;
            console.log('Additional Cost:', additionalCost);
    
            if (isNaN(totalPrice) || isNaN(laborCosts) || isNaN(additionalCost)) {
                throw new Error('Invalid price or cost values');
            }
    
            // Calculate Total Cost
            const totalCost = laborCosts + additionalCost;
            console.log('Total Cost:', totalCost);
    
            // Prepare data to be passed to the next page
            const data = {
                totalPrice,
                totalCost,
                additionalCost // Include additional cost in the data
            };
            
            localStorage.setItem('savedCalculation', JSON.stringify(window.calculationResults));
            console.log('Data to be encoded:', data);
    
            // Encode the data and pass it to the new page (p&l.html)
            const encodedData = btoa(JSON.stringify(data));
            console.log('Encoded data:', encodedData);
    
            window.location.href = `p&l.html?data=${encodedData}`;
        } catch (error) {
            console.error('Error:', error);
            alert('Error: Unable to load calculation data. Please check the values.');
        }
    }
    
    function restoreSavedCalculation() {
        const savedCalculation = localStorage.getItem('savedCalculation');
        if (savedCalculation) {
            try {
                window.calculationResults = JSON.parse(savedCalculation);
                // Update the UI with the restored values
                updateUIWithCalculationResults();
            } catch (error) {
                console.error('Error parsing saved calculation:', error);
            }
        } else {
            console.log('No saved calculation found');
        }
    }
    
    function updateUIWithCalculationResults() {
        if (!window.calculationResults) {
            console.warn("No calculation results to restore.");
            return;
        }
    
        const results = window.calculationResults;
    
        try {
            // Restore input values
            document.getElementById('totalSqFt').value = results.inputs?.totalSqFt || '';
            document.getElementById('totalFloors').value = results.inputs?.totalFloors || '';
    
            // Restore selected radio buttons for frequency
            const frequencyRadio = document.querySelector(`input[name="frequency"][value="${results.inputs?.frequency}"]`);
            if (frequencyRadio) {
                frequencyRadio.checked = true;
            }
    
            // Restore selected radio buttons for height category
            const heightCategoryRadio = document.querySelector(`input[name="heightCategory"][value="${results.inputs?.heightCategory}"]`);
            if (heightCategoryRadio) {
                heightCategoryRadio.checked = true;
            }
    
            document.getElementById('discountType').value = results.inputs?.discountType || '';
            document.getElementById('discountValue').value = results.inputs?.discountValue || '';
    
            // Update the result display
            const resultDiv = document.getElementById('result');
            if (resultDiv) {
                resultDiv.style.display = 'block'; // Ensure it's visible
    
                resultDiv.innerHTML = `
                    <h3>Service Price Breakdown</h3>
                    <table border="1" cellspacing="0" cellpadding="10">
                        <tr>
                            <th>Category</th>
                            <th>Square Footage</th>
                            <th>Price per Sq Ft</th>
                            <th>Total Price</th>
                        </tr>
                        <tr>
                            <td>Low Rise (1-5 Floors)</td>
                            <td>${results.pricing?.lowRise?.squareFootage?.toFixed(2) || '0.00'} sq ft</td>
                            <td>$0.10</td>
                            <td>$${results.pricing?.lowRise?.totalPrice?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td>Mid Rise (6-10 Floors)</td>
                            <td>${results.pricing?.midRise?.squareFootage?.toFixed(2) || '0.00'} sq ft</td>
                            <td>$0.25</td>
                            <td>$${results.pricing?.midRise?.totalPrice?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td>High Rise (11+ Floors)</td>
                            <td>${results.pricing?.highRise?.squareFootage?.toFixed(2) || '0.00'} sq ft</td>
                            <td>$0.40</td>
                            <td>$${results.pricing?.highRise?.totalPrice?.toFixed(2) || '0.00'}</td>
                        </tr>
                    </table>
    
                    <h3>Operational Costs</h3>
                    <table border="1" cellspacing="0" cellpadding="10">
                        <tr>
                            <td>Total Square Footage</td>
                            <td>${results.operationalCosts?.totalSqFt?.toFixed(0) || '0'} sq ft</td>
                        </tr>
                        <tr>
                            <td>Square Feet Cleaned Per Hour</td>
                            <td>${results.operationalCosts?.sqFtPerHour?.toFixed(0) || '0'} sq ft</td>
                        </tr>
                        <tr>
                            <td>Cleaning Hours</td>
                            <td>${results.operationalCosts?.cleaningHours?.toFixed(1) || '0.0'} hours</td>
                        </tr>
                        <tr>
                            <td>Additional Time Required (hrs)</td>
                            <td>${results.operationalCosts?.setupHours || '0'} hours</td>
                        </tr>
                        <tr>
                            <td>Total Time</td>
                            <td>${results.operationalCosts?.totalHours?.toFixed(1) || '0.0'} hours</td>
                        </tr>
                        <tr>
                            <td>Total Days</td>
                            <td>${results.operationalCosts?.totalDays?.toFixed(2) || '0.00'} days</td>
                        </tr>
                    </table>
    
                   <button type="button" class="toggle-button" onclick="toggleLaborCosts()" style="margin: 1rem 0;">
                       <i class="fas fa-users"></i>
                       Labor Costs
                   </button>
                   <div id="laborCostsSection" style="display: none; margin-top: 10px;">
                    <table border="1" cellspacing="0" cellpadding="10">
                        <tr>
                            <td>Drone Pilot</td>
                            <td>$${results.operationalCosts?.dronePilotCost?.toFixed(2) || '0.00'}</td>
                         </tr>
                          <tr>
                             <td>Visual Observer</td>
                            <td>$${results.operationalCosts?.voCost?.toFixed(2) || '0.00'}</td>
                           </tr>
                        <tr>
                             <td>Operations Manager</td>
                             <td>$${results.operationalCosts?.opsManagerCost?.toFixed(2) || '0.00'}</td>
                         </tr>
                         <tr>
                            <td><strong>Total Labor Costs</strong></td>
                               <td><strong>$${results.operationalCosts?.totalOperationalCost?.toFixed(2) || '0.00'}</strong></td>
                          </tr>
                   </table>
                 </div>
    
    
                    <h4>Final Price Breakdown</h4>
                    <table border="1" cellspacing="0" cellpadding="10">
                        <tr>
                            <td>Base Service Price</td>
                            <td>$${results.totals?.baseServicePrice?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td>Additional Cost</td>
                            <td>$${((results.otherCosts?.otherCostSubtotal || 0) + (results.waterCosts?.totalWaterCost || 0)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Subtotal</strong></td>
                            <td><strong>$${results.totals?.subtotal?.toFixed(2) || '0.00'}</strong></td>
                        </tr>
                        <tr>
                            <td>Discount (${results.inputs?.discountType === 'percentage' ? results.inputs?.discountValue + '%' : 'Fixed'})</td>
                            <td>-$${results.totals?.discountAmount?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Price</strong></td>
                            <td><strong>$${results.totals?.totalPrice?.toFixed(2) || '0.00'}</strong></td>
                        </tr>
                    </table>
                `;
            }
        } catch (error) {
            console.error("Error updating UI:", error);
        }
    }
    
    
    function restoreClientInfo() {
        const nameDisplay = document.getElementById('clientNameDisplay');
        const addressDisplay = document.getElementById('addressDisplay');
        
        if (nameDisplay) {
          nameDisplay.textContent = localStorage.getItem('clientName') || 'Unknown';
        }
        if (addressDisplay) {
          addressDisplay.textContent = localStorage.getItem('address') || 'Unknown';
        }
      }
      
    // Call this function when the page loads
    window.addEventListener('load', () => {
        restoreSavedCalculation();
        restoreClientInfo();
    });
    
    
    async function saveCalculation() {
        try {
            const token = localStorage.getItem('token');
            const country = localStorage.getItem('country');
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('clientName') || localStorage.getItem('clientName');
            const address = urlParams.get('address') || localStorage.getItem('address');

            if (!token || !country) {
                showNotification('Please log in to save calculations', 'error');
                return;
            }

            if (!name) {
                showNotification('Client name not found', 'error');
                return;
            }

            if (!address) {
                showNotification('Address not found', 'error');
                return;
            }

            // Get values from the calculation results
            if (!window.calculationResults) {
                showNotification('Please calculate the price first', 'error');
                return;
            }

            const totalPrice = window.calculationResults.totals.totalPrice;
            const discount = window.calculationResults.totals.discountAmount;
            const totalSqFt = window.calculationResults.inputs.totalSqFt;
            const cleaningType = document.querySelector('input[name="heightCategory"]:checked')?.value || 'window';

            const response = await fetch('/api/calculations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    totalPrice,
                    discount,
                    totalSqFt,
                    address,
                    country,
                    cleaningType
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save calculation');
            }

            showNotification('Calculation saved successfully');

        } catch (error) {
            console.error('Error saving calculation:', error);
            showNotification(error.message || 'Error saving calculation', 'error');
        }
    }
    
// Add the toggleLaborCosts function
function toggleLaborCosts() {
    const section = document.getElementById('laborCostsSection');
    const button = document.querySelector('button[onclick="toggleLaborCosts()"]');
    const icon = button.querySelector('i');
    const isHidden = section.style.display === 'none' || section.style.display === '';

    // Rotate icon
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    icon.style.transition = 'transform 0.3s ease';

    // Toggle section with animation
    if (isHidden) {
        section.style.display = 'block';
        section.style.opacity = '0';
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 10);
    } else {
        section.style.opacity = '0';
        section.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            section.style.display = 'none';
        }, 300);
    }
}
    