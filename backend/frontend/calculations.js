document.addEventListener('DOMContentLoaded', function() {
    const savedCalculationsContainer = document.getElementById('savedCalculationsContainer');

    if (!savedCalculationsContainer) {
        console.error("Container not found in the DOM.");
        return;
    }

    fetchAndDisplayCalculations();

    async function fetchAndDisplayCalculations() {
        try {
            const response = await fetch(`/api/calculations`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const calculations = await response.json();

            if (!calculations || calculations.length === 0) {
                savedCalculationsContainer.innerHTML = "<p>No calculations saved yet.</p>";
                return;
            }

            let tableHTML = `
                <table id="calculationsTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Total SqFt</th>
                            <th>Original Price</th>
                            <th>Total Price</th>
                            <th>Discount</th>
                            <th>Date</th>
                            <th>Cleaning Type</th>
                            
                        </tr>
                    </thead>
                    <tbody>
            `;

            calculations.forEach(calculation => {
                let currencyText;

                switch (calculation.country) {
                    case 'USA':
                        currencyText = 'USD';
                        break;
                    case 'Canada':
                        currencyText = 'CAD';
                        break;
                    case 'Mexico':
                        currencyText = 'MXN';
                        break;
                    default:
                        currencyText = 'USD';
                }

                const date = new Date(calculation.createdAt);
                const formattedDate = date.toLocaleDateString();
                const originalPrice = calculation.totalPrice + calculation.discount; // Calculate original price

                tableHTML += `
                    <tr data-id="${calculation._id}" data-original-price="${originalPrice.toFixed(2)}" data-total-price="${calculation.totalPrice}" data-discount-price="${calculation.discount}">
                        <td>${calculation.name}</td>
                        <td>${calculation.address}</td>
                        <td>${calculation.totalSqFt}</td>
                        <td class="originalPrice">${originalPrice.toFixed(2)} ${currencyText}</td>
                        <td class="totalPrice">${calculation.totalPrice} ${currencyText}</td>
                        <td class="discount">${calculation.discount}</td>
                        <td>${formattedDate}</td>
                        <td>${calculation.cleaningType}</td>
                        
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
            savedCalculationsContainer.innerHTML = "<p>Error loading calculations.</p>";
        }
    }

})