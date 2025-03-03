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
                const originalPrice = calculation.totalPrice + calculation.discount;

                tableHTML += `
                    <tr data-id="${calculation._id}" data-original-price="${originalPrice.toFixed(2)}">
                        <td>${calculation.name}</td>
                        <td>${calculation.address}</td>
                        <td>${calculation.totalSqFt}</td>
                        <td class="originalPrice">${originalPrice.toFixed(2)} ${currencyText}</td>
                        <td class="totalPrice">${calculation.totalPrice} ${currencyText}</td>
                        <td class="discount">${calculation.discount}</td>
                        <td>${formattedDate}</td>
                        <td>${calculation.cleaningType}</td>
                        <td>
                            <button class="editBtn" data-id="${calculation._id}">Edit</button>
                            <button class="deleteBtn" data-id="${calculation._id}">Delete</button>
                        </td>
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

            document.querySelectorAll('.editBtn').forEach(button => {
                button.addEventListener('click', editCalculation);
            });

        } catch (error) {
            console.error("Error fetching calculations:", error);
            savedCalculationsContainer.innerHTML = "<p>Error loading calculations.</p>";
        }
    }

    async function deleteCalculation(event) {
        const id = event.target.dataset.id;

        if (!id) {
            console.error('Calculation ID is undefined or empty');
            alert('Cannot delete: Calculation ID is missing');
            return;
        }

        if (!confirm("Are you sure you want to delete this calculation?")) {
            return;
        }

        const url = `/api/calculations/${id}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const row = event.target.closest('tr');
            row.remove();

            const tbody = document.querySelector('#calculationsTable tbody');
            if (tbody.children.length === 0) {
                savedCalculationsContainer.innerHTML = "<p>No calculations saved yet.</p>";
            }

        } catch (error) {
            console.error("Error deleting calculation:", error);
            alert(`Error deleting calculation: ${error.message}`);
        }
    }

    function editCalculation(event) {
        const id = event.target.dataset.id;
        const row = event.target.closest('tr');

        const originalPrice = parseFloat(row.dataset.originalPrice);

        const totalPriceCell = row.querySelector('.totalPrice');
        const discountCell = row.querySelector('.discount');

        const originalTotalPrice = parseFloat(totalPriceCell.textContent.replace(/[^\d.]/g, ''));
        const originalDiscount = parseFloat(discountCell.textContent.replace(/[^\d.]/g, ''));

        totalPriceCell.innerHTML = `<input type="number" class="editTotalPrice" value="${originalTotalPrice}" readonly>`;
        discountCell.innerHTML = `<input type="number" class="editDiscount" value="${originalDiscount}">`;

        const editButtonsHTML = `
            <button class="saveBtn" data-id="${id}" data-original-price="${originalPrice}">Save</button>
            <button class="cancelBtn" data-id="${id}">Cancel</button>
        `;

        row.querySelector('td:last-child').innerHTML = editButtonsHTML;

        row.querySelector('.saveBtn').addEventListener('click', () => saveCalculation(id, row, originalPrice));
        row.querySelector('.cancelBtn').addEventListener('click', () => cancelEdit(row, originalTotalPrice, originalDiscount));
    }

    async function saveCalculation(id, row, originalPrice) {
        const newDiscount = parseFloat(row.querySelector('.editDiscount').value);
        const newTotalPrice = originalPrice - newDiscount;
    
        try {
            const response = await fetch(`/api/calculations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    totalPrice: newTotalPrice,
                    discount: newDiscount,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
    
            row.querySelector('.totalPrice').textContent = data.totalPrice;
            row.querySelector('.discount').textContent = data.discount;
    
            // Update the row with new action buttons
            const actionButtonsHTML = `
                <button class="editBtn" data-id="${id}">Edit</button>
                <button class="deleteBtn" data-id="${id}">Delete</button>
            `;
            row.querySelector('td:last-child').innerHTML = actionButtonsHTML;
    
            // Re-attach event listeners
            row.querySelector('.editBtn').addEventListener('click', editCalculation);
            row.querySelector('.deleteBtn').addEventListener('click', deleteCalculation);
    
            alert('Calculation updated successfully!');
    
        } catch (error) {
            console.error("Error updating calculation:", error);
            alert(`Error updating calculation: ${error.message}`);
        }
    }
    

    function cancelEdit(row, originalTotalPrice, originalDiscount) {
        row.querySelector('.totalPrice').textContent = originalTotalPrice;
        row.querySelector('.discount').textContent = originalDiscount;

        const id = row.dataset.id;
        const actionButtonsHTML = `
            <button class="editBtn" data-id="${id}">Edit</button>
            <button class="deleteBtn" data-id="${id}">Delete</button>
        `;
        row.querySelector('td:last-child').innerHTML = actionButtonsHTML;

        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', deleteCalculation);
        });

        document.querySelectorAll('.editBtn').forEach(button => {
            button.addEventListener('click', editCalculation);
        });
    }
});
