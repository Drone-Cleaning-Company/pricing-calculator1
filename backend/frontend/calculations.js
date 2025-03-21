document.addEventListener('DOMContentLoaded', function() {
    const savedCalculationsContainer = document.getElementById('savedCalculationsContainer');

    if (!savedCalculationsContainer) {
        console.error("Container not found in the DOM.");
        return;
    }

    // Add CSS for consistent column styling
    const style = document.createElement('style');
    style.textContent = `
        #calculationsTable {
            width: 100%;
        }
        #calculationsTable td {
            color: #000;
        }
        #calculationsTable td i {
            color: #000;
        }
    `;
    document.head.appendChild(style);

    fetchAndDisplayCalculations();

    async function fetchAndDisplayCalculations() {
        try {
            // Get country and token from localStorage
            const userCountry = localStorage.getItem('country') || 'USA';
            const token = localStorage.getItem('token');

            if (!token) {
                savedCalculationsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: rgba(255, 0, 0, 0.3);"></i>
                        <p style="margin-top: 1rem;">Please log in to view your calculations.</p>
                    </div>
                `;
                return;
            }

            console.log('Fetching calculations for country:', userCountry);
            
            const response = await fetch(`/api/calculations?country=${encodeURIComponent(userCountry)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received calculations:', data);
            
            // Ensure we have an array of calculations
            const calculations = Array.isArray(data) ? data : [];
            
            if (calculations.length === 0) {
                savedCalculationsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-calculator" style="font-size: 3rem; color: rgba(0, 255, 255, 0.3);"></i>
                        <p style="margin-top: 1rem;">No calculations found for ${userCountry}.</p>
                    </div>
                `;
                return;
            }

            let tableHTML = `
                <table id="calculationsTable">
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Name</th>
                            <th><i class="fas fa-map-marker-alt"></i> Address</th>
                            <th><i class="fas fa-chart-area"></i> Total SqFt</th>
                            <th><i class="fas fa-money-bill"></i> Currency</th>
                            <th><i class="fas fa-dollar-sign"></i> Total Price</th>
                            <th><i class="fas fa-dollar-sign"></i> Discount Amount</th>
                            <th><i class="fas fa-calendar"></i> Date</th>
                            <th><i class="fas fa-broom"></i> Cleaning Type</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            calculations.forEach(calculation => {
                let currencyText;
                let currencyIcon;

                switch (calculation.country) {
                    case 'USA':
                        currencyText = 'USD';
                        currencyIcon = 'dollar-sign';
                        break;
                    case 'Canada':
                        currencyText = 'CAD';
                        currencyIcon = 'dollar-sign';
                        break;
                    case 'Mexico':
                        currencyText = 'MXN';
                        currencyIcon = 'peso-sign';
                        break;
                    default:
                        currencyText = 'USD';
                        currencyIcon = 'dollar-sign';
                }

                const date = new Date(calculation.createdAt);
                const formattedDate = date.toLocaleDateString();
                const totalPrice = Math.round(calculation.totalPrice * 100) / 100;
                const discount = Math.round((calculation.discount || 0) * 100) / 100;

                tableHTML += `
                    <tr>
                        <td><i class="fas fa-user-circle"></i> ${calculation.name || 'N/A'}</td>
                        <td><i class="fas fa-building"></i> ${calculation.address || 'N/A'}</td>
                        <td><i class="fas fa-ruler"></i> ${calculation.totalSqFt || 0}</td>
                        <td class="currency"><i class="fas fa-${currencyIcon}"></i> ${currencyText}</td>
                        <td class="price-cell">${totalPrice}</td>
                        <td class="price-cell"><i class="fas fa-tag"></i> ${discount}</td>
                        <td><i class="far fa-calendar-alt"></i> ${formattedDate}</td>
                        <td><i class="fas fa-spray-can"></i> ${calculation.cleaningType || 'N/A'}</td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            savedCalculationsContainer.innerHTML = tableHTML;

        } catch (error) {
            console.error("Error fetching calculations:", error);
            savedCalculationsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: rgba(255, 0, 0, 0.3);"></i>
                    <p style="margin-top: 1rem;">Error loading calculations: ${error.message}</p>
                </div>
            `;
        }
    }
});