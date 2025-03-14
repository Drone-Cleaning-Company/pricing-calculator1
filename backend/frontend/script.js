document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calculatorForm');
    const buildingCountSelect = document.getElementById('buildingCount');
    const buildingsContainer = document.getElementById('buildingsContainer');
    const cleaningTypeSelect = document.getElementById('cleaningType');
    const glassPercentageInput = document.getElementById('glassPercentage');
    const glassPercentageSlider = document.getElementById('glassPercentageSlider');
    const glassSection = document.getElementById('glassSection');
    const glassVisual = document.getElementById('glassVisual');
    const calculateButton = document.getElementById('calculateButton');

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

    if (calculateButton) {
        calculateButton.addEventListener('click', calculatePrice);
    }

    if (cleaningTypeSelect) {
        cleaningTypeSelect.addEventListener('change', function() {
            if (this.value === 'facade') {
                glassPercentageInput.value = 100;
                glassPercentageSlider.value = 100;
                glassPercentageInput.disabled = true;
                glassPercentageSlider.disabled = true;
                glassSection.style.opacity = '0.7';
                updateGlassVisual(100);
            } else {
                glassPercentageInput.disabled = false;
                glassPercentageSlider.disabled = false;
                glassSection.style.opacity = '1';
                updateGlassVisual(glassPercentageInput.value);
            }
        });
    }

    // Initialize glass percentage visualization
    if (glassPercentageInput && glassPercentageSlider) {
        // Sync input and slider
        glassPercentageInput.addEventListener('input', function() {
            let value = this.value;
            if (value < 0) value = 0;
            if (value > 100) value = 100;
            glassPercentageSlider.value = value;
            updateGlassVisual(value);
        });

        glassPercentageSlider.addEventListener('input', function() {
            glassPercentageInput.value = this.value;
            updateGlassVisual(this.value);
        });

        // Initialize visual
        updateGlassVisual(glassPercentageInput.value);
    }

    function updateBuildingInputs(count) {
        buildingsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const buildingSection = document.createElement('div');
            buildingSection.className = 'building-section';
            buildingSection.innerHTML = `
                <h3><i class="fas fa-building"></i> Building ${i}</h3>
                <div class="form-group">
                    <label for="length${i}">
                        <i class="fas fa-arrows-alt-h"></i> 
                        Perimeter (ft)
                        <span class="tooltip" data-tooltip="Total distance around the building's exterior">?</span>
                    </label>
                    <input type="number" 
                           id="length${i}" 
                           required 
                           step="0.01" 
                           min="0" 
                           placeholder="Enter building perimeter"
                           onchange="validateNumber(this, 0)"
                           oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
                    <div class="help-text">Measure the total distance around the building</div>
                </div>
                <div class="form-group">
                    <label for="height${i}">
                        <i class="fas fa-arrows-alt-v"></i> 
                        Height per Floor (ft)
                        <span class="tooltip" data-tooltip="Average height of each floor">?</span>
                    </label>
                    <input type="number" 
                           id="height${i}" 
                           required 
                           step="0.01" 
                           min="8" 
                           value="10"
                           placeholder="Enter floor height"
                           onchange="validateNumber(this, 8)"
                           oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
                    <div class="help-text">Standard floor height is typically 10-12 feet</div>
                </div>
                <div class="form-group">
                    <label for="floors${i}">
                        <i class="fas fa-layer-group"></i> 
                        Number of Floors
                        <span class="tooltip" data-tooltip="Total number of floors in the building">?</span>
                    </label>
                    <input type="number" 
                           id="floors${i}" 
                           required 
                           min="1" 
                           placeholder="Enter number of floors"
                           onchange="validateNumber(this, 1)"
                           oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                    <div class="help-text">Must be at least 1 floor</div>
                </div>
                <div class="building-preview">
                    <div class="preview-info">
                        <span>Estimated Area: </span>
                        <span id="estimatedArea${i}">0 sq ft</span>
                    </div>
                </div>
            `;
            buildingsContainer.appendChild(buildingSection);

            // Add real-time area calculation
            ['length', 'height', 'floors'].forEach(field => {
                document.getElementById(`${field}${i}`).addEventListener('input', () => {
                    updateEstimatedArea(i);
                });
            });
        }
    }

    function updateEstimatedArea(buildingIndex) {
        const length = parseFloat(document.getElementById(`length${buildingIndex}`).value) || 0;
        const height = parseFloat(document.getElementById(`height${buildingIndex}`).value) || 0;
        const floors = parseInt(document.getElementById(`floors${buildingIndex}`).value) || 0;
        
        const area = length * height * floors;
        const estimatedAreaElement = document.getElementById(`estimatedArea${buildingIndex}`);
        estimatedAreaElement.textContent = `${area.toFixed(2)} sq ft`;
        
        // Add visual feedback
        estimatedAreaElement.style.color = area > 0 ? '#ff9500' : '#ff6b6b';
    }
});

// Add validation function
function validateNumber(input, min) {
    const value = parseFloat(input.value);
    if (value < min) {
        input.value = min;
    }
}

function calculatePrice() {
    const clientName = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const cleaningType = document.getElementById('cleaningType').value;
    let glassPercentage;
    const buildingCount = parseInt(document.getElementById('buildingCount').value);

    if (cleaningType === 'facade') {
        glassPercentage = 1;
        document.getElementById('glassPercentage').value = 100;
    } else {
        glassPercentage = parseFloat(document.getElementById('glassPercentage').value) / 100;
    }

    if (isNaN(glassPercentage) || glassPercentage < 0 || glassPercentage > 1) {
        alert('Please enter a valid glass percentage between 0 and 100.');
        return;
    }

    let totalArea = 0;
    let details = [];
    let totalFloors = 0;

    for (let i = 1; i <= buildingCount; i++) {
        const length = parseFloat(document.getElementById(`length${i}`).value);
        const height = parseFloat(document.getElementById(`height${i}`).value);
        const floors = parseInt(document.getElementById(`floors${i}`).value);

        if (isNaN(length) || isNaN(height) || isNaN(floors) || length <= 0 || height <= 0 || floors <= 0) {
            alert(`Please enter valid dimensions for Building ${i}.`);
            return;
        }

        totalFloors += floors;
        const buildingArea = length * height * floors;
        totalArea += buildingArea;

        details.push({
            building: i,
            length,
            height,
            floors,
            area: buildingArea
        });
    }

    localStorage.setItem('totalFloors', totalFloors.toString());
    const totalGlassArea = totalArea * glassPercentage;

    displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details, cleaningType);
    setupContinueButton(totalGlassArea, cleaningType, totalFloors);
    saveCalculation(clientName, totalGlassArea, cleaningType, address);
}

function displayCalculationDetails(clientName, address, totalArea, glassPercentage, totalGlassArea, details, cleaningType) {
    const result = document.getElementById('result');
    result.style.display = 'block';

    let detailsHTML = `
        <h2><i class="fas fa-clipboard-list"></i> Calculation Summary</h2>
        <div class="calculation-details">
            <div class="client-details">
                <h3><i class="fas fa-user"></i> Client Details</h3>
                <p><strong>Name:</strong> ${clientName}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Service Type:</strong> ${cleaningType === 'facade' ? 'Facade Cleaning' : 'Window Cleaning'}</p>
            </div>

            <div class="measurements-table">
                <h3><i class="fas fa-ruler-combined"></i> Building Measurements</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Building</th>
                            <th>Perimeter (ft)</th>
                            <th>Floor Height (ft)</th>
                            <th>Floors</th>
                            <th>Total Area (sq ft)</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    details.forEach(detail => {
        detailsHTML += `
            <tr>
                <td>Building ${detail.building}</td>
                <td>${detail.length.toFixed(2)}</td>
                <td>${detail.height.toFixed(2)}</td>
                <td>${detail.floors}</td>
                <td>${detail.area.toFixed(2)}</td>
            </tr>
        `;
    });

    detailsHTML += `
                    </tbody>
                </table>
            </div>

            <div class="final-calculations">
                <h3><i class="fas fa-calculator"></i> Final Calculations</h3>
                <div class="calculation-grid">
                    <div class="calc-item">
                        <span class="calc-label">Total Wall Area:</span>
                        <span class="calc-value">${totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calc-item">
                        <span class="calc-label">Glass Coverage:</span>
                        <span class="calc-value">${(glassPercentage * 100).toFixed(2)}%</span>
                    </div>
                    <div class="calc-item highlight">
                        <span class="calc-label">Total Area to Clean:</span>
                        <span class="calc-value">${totalGlassArea.toFixed(2)} sq ft</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    result.innerHTML = detailsHTML;

    // Add styles for the new elements
    const style = document.createElement('style');
    style.textContent = `
        .calculation-details {
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 15px;
            padding: 2rem;
            margin: 1rem 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .client-details, .measurements-table, .final-calculations {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e5e5;
        }

        .final-calculations {
            border-bottom: none;
            padding-bottom: 0;
        }

        .calculation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .calc-item {
            background: #f9f9fb;
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #e5e5e5;
        }

        .calc-item.highlight {
            background: rgba(255, 149, 0, 0.05);
            border: 1px solid rgba(255, 149, 0, 0.2);
        }

        .calc-label {
            color: #86868b;
            font-weight: 500;
        }

        .calc-value {
            color: #1d1d1f;
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
        }

        .calc-item.highlight .calc-value {
            color: #ff9500;
        }

        h3 {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1d1d1f;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        h3 i {
            color: #ff9500;
            font-size: 1.2em;
        }

        /* Table Styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: #f9f9fb;
            border-radius: 12px;
            overflow: hidden;
        }

        thead {
            background: #f5f5f7;
        }

        th {
            padding: 1rem;
            text-align: left;
            color: #86868b;
            font-weight: 600;
            white-space: nowrap;
            border-bottom: 1px solid #e5e5e5;
        }

        td {
            padding: 1rem;
            text-align: left;
            color: #1d1d1f;
            border-bottom: 1px solid #e5e5e5;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tbody tr:hover td {
            background: rgba(255, 149, 0, 0.05);
        }

        /* Responsive table */
        @media (max-width: 768px) {
            .calculation-details {
                padding: 1rem;
            }
            
            table {
                font-size: 0.85rem;
            }
            
            th, td {
                padding: 0.6rem 0.5rem;
            }
            
            .measurements-table {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            .measurements-table table {
                min-width: 600px;
            }
        }
    `;
    document.head.appendChild(style);

    const continueSection = document.getElementById('continueSection');
    continueSection.style.display = 'block';
}

function setupContinueButton(totalGlassArea, cleaningType, totalFloors) {
    const continueButton = document.getElementById('continueButton');
    
    continueButton.addEventListener('click', function () {
        const clientName = document.getElementById('clientName').value.trim();
        const address = document.getElementById('clientAddress').value.trim();

        if (!clientName || !address) {
            alert('Please enter client name and address.');
            return;
        }

        localStorage.setItem('clientName', clientName);
        localStorage.setItem('address', address);
        localStorage.setItem('totalSqFt', totalGlassArea.toString());
        localStorage.setItem('cleaningType', cleaningType);
        localStorage.setItem('totalFloors', totalFloors);

        window.location.href = `pricingDetails.html?sqft=${encodeURIComponent(totalGlassArea)}&clientName=${encodeURIComponent(clientName)}&address=${encodeURIComponent(address)}&cleaningType=${encodeURIComponent(cleaningType)}&totalFloors=${encodeURIComponent(totalFloors)}`;
    });
}

function updateGlassVisual(percentage) {
    const glassVisual = document.getElementById('glassVisual');
    if (!glassVisual) return;

    // Update the visual representation
    const windows = glassVisual.getElementsByClassName('window');
    const totalWindows = windows.length;
    const activeWindows = Math.round((percentage / 100) * totalWindows);

    for (let i = 0; i < totalWindows; i++) {
        if (i < activeWindows) {
            windows[i].classList.add('active');
        } else {
            windows[i].classList.remove('active');
        }
    }

    // Update the percentage display
    const percentageDisplay = document.getElementById('percentageDisplay');
    if (percentageDisplay) {
        percentageDisplay.textContent = `${Math.round(percentage)}%`;
        
        // Update color based on percentage (orange hue instead of cyan)
        const hue = Math.min(percentage * 0.4, 40); // 0 to 40 (red to orange)
        percentageDisplay.style.color = `hsl(${hue}, 100%, 50%)`;
    }
}
