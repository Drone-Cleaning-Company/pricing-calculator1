document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calculatorForm');
    const buildingCountSelect = document.getElementById('buildingCount');
    const buildingsContainer = document.getElementById('buildingsContainer');
    const cleaningTypeSelect = document.getElementById('cleaningType');
    const glassPercentageInput = document.getElementById('glassPercentage');

    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            calculatePrice();
        };
    }

    if (buildingCountSelect) {
        buildingCountSelect.addEventListener('change', function() {
            updateBuildingInputs(this.value);
        });
        updateBuildingInputs(buildingCountSelect.value); // Initial setup
    }

    cleaningTypeSelect.addEventListener('change', function() {
        if (this.value === 'facade') {
            glassPercentageInput.value = 100;
            glassPercentageInput.disabled = true;
        } else {
            glassPercentageInput.disabled = false;
        }
    });

    function updateBuildingInputs(count) {
        buildingsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            buildingsContainer.innerHTML += `
                <div class="building-section">
    <h3>Building ${i}</h3>
    <div class="form-group">
        <label for="length${i}">Perimeter (ft):</label>
        <input type="number" id="length${i}" required step="0.01">
    </div>
    <div class="form-group">
        <label for="height${i}">Height of floor (ft):</label>
        <input type="number" id="height${i}" required step="0.01" value="10"> <!-- Default value set to 10 -->
    </div>
    <div class="form-group">
        <label for="floors${i}">Number of Floors:</label>
        <input type="number" id="floors${i}" required>
    </div>
</div>

            `;
        }
    }
});

function calculatePrice() {
    const clientName = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const cleaningType = document.getElementById('cleaningType').value;
    let glassPercentage;
    const buildingCount = parseInt(document.getElementById('buildingCount').value);

    if (cleaningType === 'facade') {
        glassPercentage = 1; // 100% coverage for facade cleaning
        document.getElementById('glassPercentage').value = 100; // Update the input field
    } else {
        glassPercentage = parseFloat(document.getElementById('glassPercentage').value) / 100;
    }

    if (isNaN(glassPercentage) || glassPercentage < 0 || glassPercentage > 1) {
        alert('Please enter a valid glass percentage between 0 and 100.');
        return;
    }

    let totalArea = 0;
    let details = [];

    for (let i = 1; i <= buildingCount; i++) {
        const length = parseFloat(document.getElementById(`length${i}`).value);
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const floors = parseInt(document.getElementById(`floors${i}`).value);

        if (isNaN(length) || isNaN(height) || isNaN(floors) || length <= 0 || height <= 0 || floors <= 0) {
            alert(`Please enter valid dimensions for Building ${i}.`);
            return;
        }

        const buildingArea = length * height * floors; // Assuming two sides of the building
        totalArea += buildingArea;

        details.push({
            building: i,
            length,
            height,
            floors,
            area: buildingArea
        });
    }

    const totalGlassArea = totalArea * glassPercentage;

    displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details, cleaningType);
    setupContinueButton(totalGlassArea, cleaningType);
    saveCalculation(clientName, totalGlassArea, cleaningType);
}

function displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details, cleaningType) {
    const result = document.getElementById('result');
    result.style.display = 'block';

    let detailsHTML = `
        <h3>Calculation Details for ${clientName}</h3>
        <p>Address: ${address}</p>
        <p>Cleaning Type: ${cleaningType === 'facade' ? 'Facade Cleaning' : 'Window Cleaning'}</p>
        <table>
            <tr>
                <th>Building</th>
                <th>Perimeter (ft)</th>
                <th>Height of floor (ft)</th>
                <th>Floors</th>
                <th>Area (sq ft)</th>
            </tr>
    `;

    details.forEach(detail => {
        detailsHTML += `
            <tr>
                <td>Building ${detail.building}</td>
                <td>${detail.length}</td>
                <td>${detail.height}</td>
                <td>${detail.floors}</td>
                <td>${detail.area.toFixed(2)}</td>
            </tr>
        `;
    });

    detailsHTML += `
        </table>
        <h4>Summary:</h4>
        <p>Total Wall Area: ${totalArea.toFixed(2)} sq ft</p>
        <p>Glass Coverage: ${(glassPercentage * 100).toFixed(2)}%</p>
        <p>Total Area to Clean: ${totalGlassArea.toFixed(2)} sq ft</p>
    `;

    result.innerHTML = detailsHTML;

    const continueSection = document.getElementById('continueSection');
    continueSection.style.display = 'block';
}

function setupContinueButton(totalGlassArea, cleaningType) {
    console.log('setupContinueButton called'); // For debugging

    const clientName = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();

    if (!clientName || !address) {
        alert('Please enter client name and address.');
        return;
    }

    document.getElementById('continueButton').addEventListener('click', function () {
        console.log('Continue button clicked'); // For debugging

        // Store data in localStorage
        localStorage.setItem('clientName', clientName);
        localStorage.setItem('address', address);
        localStorage.setItem('totalSqFt', totalGlassArea.toString());
        localStorage.setItem('cleaningType', cleaningType);

        // Navigate to pricing details page with parameters
        window.location.href = `pricingDetails.html?sqft=${encodeURIComponent(totalGlassArea)}&clientName=${encodeURIComponent(clientName)}&address=${encodeURIComponent(address)}&cleaningType=${encodeURIComponent(cleaningType)}`;
    });
}

async function saveCalculation(clientName, totalGlassArea, cleaningType) {
    try {
        const response = await fetch('/api/calculations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: clientName, // Changed to 'name' to match backend
                totalSqFt: totalGlassArea, // Changed to 'totalSqFt' to match backend
                cleaningType: cleaningType,
                address: address, // Added address
                // Add other necessary fields here
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error saving calculation:', error.message);
        } else {
            console.log('Calculation saved successfully!');
        }
    } catch (error) {
        console.error('Error saving calculation:', error);
    }
}
