// frontend/adminCalculations.js
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
            const response = await fetch(`/api/calculations`); // Fetch ALL calculations
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
                            <th>Country</th>
                            <th>Action</th>
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
                        <td>${calculation.country}</td>
                        <td><button class="deleteBtn" data-id="${calculation._id}">Delete</button></td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            savedCalculationsContainer.innerHTML = tableHTML;

            document.querySelectorAll('.deleteBtn').forEach(button => {
                button.addEventListener('click', deleteCalculation);
            });

        } catch (error) {
            console.error("Error fetching calculations:", error);
            savedCalculationsContainer.innerHTML = "<p>Error loading calculations.</p>";
        }
    }

    async function deleteCalculation(event) {
        const id = event.target.dataset.id;
        console.log('Attempting to delete calculation with ID:', id);

        if (!id) {
            console.error('Calculation ID is undefined or empty');
            alert('Cannot delete: Calculation ID is missing');
            return;
        }

        // Add confirmation dialog
        if (!confirm("Are you sure you want to delete this calculation?")) {
            return; // If user clicks "Cancel", do nothing
        }

        const url = `/api/calculations/${id}`;
        console.log('Delete request URL:', url);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });

            console.log('Delete response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const row = event.target.closest('tr');
            row.remove();

            const tbody = document.querySelector('#calculationsTable tbody');
            if (tbody.children.length === 0) {
                savedCalculationsContainer.innerHTML = "<p>No calculations saved yet.</p>";
            }

            console.log('Calculation deleted successfully');

        } catch (error) {
            console.error("Error deleting calculation:", error);
            alert(`Error deleting calculation: ${error.message}`);
        }
    }
});
