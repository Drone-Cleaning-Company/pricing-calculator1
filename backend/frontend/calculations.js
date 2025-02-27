document.addEventListener('DOMContentLoaded', function() {
    const savedCalculationsContainer = document.getElementById('savedCalculationsContainer');
    const Date = globalThis.Date;

    if (!savedCalculationsContainer) {
        console.error("Container not found in the DOM.");
        return;
    }

    fetchAndDisplayCalculations();

    async function fetchAndDisplayCalculations() {
        try {
            const country = localStorage.getItem('country');
            const response = await fetch(`/api/calculations?country=${country}`);
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
                            <th>Total Price</th>
                            <th>Discount</th>
                            <th>Date</th>
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
                tableHTML += `
                    <tr data-id="${calculation._id}">
                        <td>${calculation.name}</td>
                        <td>${calculation.address}</td>
                        <td>${calculation.totalSqFt}</td>
                        <td>${calculation.totalPrice} ${currencyText}</td>
                        <td>${calculation.discount}</td>
                        <td>${formattedDate}</td>
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
    
});
