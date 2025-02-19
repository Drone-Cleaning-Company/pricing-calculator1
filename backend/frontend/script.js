document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calculatorForm');
    const buildingCountSelect = document.getElementById('buildingCount');
    const buildingsContainer = document.getElementById('buildingsContainer');

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

    function updateBuildingInputs(count) {
        buildingsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            buildingsContainer.innerHTML += `
                <div class="building-section">
                    <h3>Building ${i}</h3>
                    <div class="form-group">
                        <label for="length${i}">Length (ft):</label>
                        <input type="number" id="length${i}" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="height${i}">Height (ft):</label>
                        <input type="number" id="height${i}" required step="0.01">
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
    const glassPercentage = parseFloat(document.getElementById('glassPercentage').value) / 100;
    const buildingCount = parseInt(document.getElementById('buildingCount').value);

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

    displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details);
    setupContinueButton(totalGlassArea);
    saveCalculation(clientName, totalGlassArea);
}

function displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details) {
    const result = document.getElementById('result');
    result.style.display = 'block';

    let detailsHTML = `
        <h3>Calculation Details for ${clientName}</h3>
        <p>Address: ${address}</p>
        <table>
            <tr>
                <th>Building</th>
                <th>Length (ft)</th>
                <th>Height (ft)</th>
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
        <p>Total Glass Area to Clean: ${totalGlassArea.toFixed(2)} sq ft</p>
    `;

    result.innerHTML = detailsHTML;

    const continueSection = document.getElementById('continueSection');
    continueSection.style.display = 'block';
}

function setupContinueButton(totalGlassArea) {
    const clientName = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();

    if (!clientName || !address) {
        alert('Please enter client name and address.');
        return;
    }

    document.getElementById('continueButton').addEventListener('click', function () {
        window.location.href = `pricingDetails.html?sqft=${totalGlassArea.toFixed(2)}&clientName=${encodeURIComponent(clientName)}&address=${encodeURIComponent(address)}`;
    });
}

async function saveCalculation(clientName, totalGlassArea) {
    try {
        const response = await fetch('/api/calculations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName,
                totalGlassArea,
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
