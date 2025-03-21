document.addEventListener('DOMContentLoaded', function() {
    const savedCalculationsContainer = document.getElementById('savedCalculationsContainer');

    if (!savedCalculationsContainer) {
        showNotification("Container not found in the DOM.", "error");
        return;
    }

    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        window.location.href = '/user.html';
        return;
    }

    // Add CSS for consistent column styling
    const style = document.createElement('style');
    style.textContent = `
        #calculationsTable {
            width: 100%;
            table-layout: fixed;
        }
        #calculationsTable th:last-child, 
        #calculationsTable td:last-child {
            width: 220px;
            white-space: nowrap;
        }
        #calculationsTable td {
            color: #000;
        }
        #calculationsTable td i {
            color: #000;
        }
        .editBtn, .deleteBtn {
            display: inline-block;
            margin: 2px 5px;
            padding: 5px 10px;
            width: 80px;
            text-align: center;
        }
        .actions-container {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
        }
    `;
    document.head.appendChild(style);

    fetchAndDisplayCalculations();

    async function fetchAndDisplayCalculations() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/index.html';
                return;
            }

            const response = await fetch('/api/calculations/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/index.html';
                    return;
                }
                if (response.status === 403) {
                    window.location.href = '/user.html';
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const calculations = await response.json();

            if (!calculations || calculations.length === 0) {
                savedCalculationsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-calculator" style="font-size: 3rem; color: rgba(0, 255, 255, 0.3);"></i>
                        <p style="margin-top: 1rem;">No calculations saved yet.</p>
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
                            <th><i class="fas fa-globe"></i> Country</th>
                            <th><i class="fas fa-chart-area"></i> Total SqFt</th>
                            <th><i class="fas fa-money-bill"></i> Currency</th>
                            <th><i class="fas fa-dollar-sign"></i> Total Price</th>
                            <th><i class="fas fa-dollar-sign"></i> Discount Amount</th>
                            <th><i class="fas fa-calendar"></i> Date</th>
                            <th><i class="fas fa-broom"></i> Cleaning Type</th>
                            <th><i class="fas fa-cogs"></i> Actions</th>
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
                const originalPrice = Math.round((calculation.totalPrice + calculation.discount) * 100) / 100;
                const totalPrice = Math.round(calculation.totalPrice * 100) / 100;
                const discount = Math.round(calculation.discount * 100) / 100;

                tableHTML += `
                    <tr data-id="${calculation._id}" data-original-price="${originalPrice}" data-currency="${currencyText}" data-currency-icon="${currencyIcon}">
                        <td><i class="fas fa-user-circle"></i> ${calculation.name}</td>
                        <td><i class="fas fa-building"></i> ${calculation.address}</td>
                        <td><i class="fas fa-globe"></i> ${calculation.country}</td>
                        <td>${calculation.totalSqFt}</td>
                        <td class="currency"><i class="fas fa-${currencyIcon}"></i> ${currencyText}</td>
                        <td class="totalPrice">${totalPrice}</td>
                        <td class="discount"><i class="fas fa-tag"></i> ${discount}</td>
                        <td><i class="far fa-calendar-alt"></i> ${formattedDate}</td>
                        <td><i class="fas fa-spray-can"></i> ${calculation.cleaningType}</td>
                        <td>
                            <div class="actions-container">
                                <button class="editBtn" data-id="${calculation._id}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="deleteBtn" data-id="${calculation._id}">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            savedCalculationsContainer.innerHTML = tableHTML;

            // Add event listeners
            document.querySelectorAll('.deleteBtn').forEach(button => {
                button.addEventListener('click', deleteCalculation);
            });

            document.querySelectorAll('.editBtn').forEach(button => {
                button.addEventListener('click', editCalculation);
            });

        } catch (error) {
            console.error("Error fetching calculations:", error);
            showNotification("Error loading calculations.", "error");
            savedCalculationsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: rgba(255, 0, 0, 0.3);"></i>
                    <p style="margin-top: 1rem;">Error loading calculations.</p>
                </div>
            `;
        }
    }

    async function deleteCalculation(event) {
        const id = event.target.closest('.deleteBtn').dataset.id;

        if (!id) {
            showNotification("Cannot delete: Calculation ID is missing", "error");
            return;
        }

        if (!confirm("Are you sure you want to delete this calculation?")) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        const url = `/api/calculations/${id}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/index.html';
                    return;
                }
                if (response.status === 403) {
                    window.location.href = '/user.html';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const row = event.target.closest('tr');
            row.style.transform = 'translateX(100%)';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                const tbody = document.querySelector('#calculationsTable tbody');
                if (tbody.children.length === 0) {
                    savedCalculationsContainer.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <i class="fas fa-calculator" style="font-size: 3rem; color: rgba(0, 255, 255, 0.3);"></i>
                            <p style="margin-top: 1rem;">No calculations saved yet.</p>
                        </div>
                    `;
                }
            }, 300);

            showNotification("Calculation deleted successfully!", "success");

        } catch (error) {
            console.error("Error deleting calculation:", error);
            showNotification(`Error deleting calculation: ${error.message}`, "error");
        }
    }

    function editCalculation(event) {
        const id = event.target.closest('.editBtn').dataset.id;
        const row = event.target.closest('tr');

        const originalPrice = parseFloat(row.dataset.originalPrice);
        const currency = row.dataset.currency;
        const currencyIcon = row.dataset.currencyIcon;

        const totalPriceCell = row.querySelector('.totalPrice');
        const discountCell = row.querySelector('.discount');
        const currencyCell = row.querySelector('.currency');

        const originalTotalPrice = Math.round(parseFloat(totalPriceCell.textContent.replace(/[^\d.]/g, '')) * 100) / 100;
        const originalDiscount = Math.round(parseFloat(discountCell.textContent.replace(/[^\d.]/g, '')) * 100) / 100;

        totalPriceCell.innerHTML = `
            <div class="input-group">
                <input type="number" class="editTotalPrice" value="${originalTotalPrice}" readonly step="0.01">
            </div>
        `;
        
        discountCell.innerHTML = `
            <div class="input-group">
                <input type="number" class="editDiscount" value="${originalDiscount}" step="0.01">
            </div>
        `;

        // Keep the currency display unchanged
        currencyCell.innerHTML = `<i class="fas fa-${currencyIcon}"></i> ${currency}`;

        const editButtonsHTML = `
            <div class="actions-container">
                <button class="saveBtn" data-id="${id}" data-original-price="${originalPrice}">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="cancelBtn" data-id="${id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;

        row.querySelector('td:last-child').innerHTML = editButtonsHTML;

        row.querySelector('.saveBtn').addEventListener('click', () => saveCalculation(id, row, originalPrice));
        row.querySelector('.cancelBtn').addEventListener('click', () => cancelEdit(row, originalTotalPrice, originalDiscount, currency, currencyIcon));

        // Add animation to the edited row
        row.style.backgroundColor = 'rgba(0, 255, 255, 0.05)';
    }

    async function saveCalculation(id, row, originalPrice) {
        const newDiscount = Math.round(parseFloat(row.querySelector('.editDiscount').value) * 100) / 100;
        const newTotalPrice = Math.round((originalPrice - newDiscount) * 100) / 100;
        const currency = row.dataset.currency;
        const currencyIcon = row.dataset.currencyIcon;
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/index.html';
                return;
            }

            const response = await fetch(`/api/calculations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    totalPrice: newTotalPrice,
                    discount: newDiscount,
                }),
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/index.html';
                    return;
                }
                if (response.status === 403) {
                    window.location.href = '/user.html';
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to update calculation');
            }
    
            const data = await response.json();
    
            // Update the cells with the new values
            row.querySelector('.totalPrice').innerHTML = `${Math.round(data.totalPrice * 100) / 100}`;
            row.querySelector('.discount').innerHTML = `<i class="fas fa-tag"></i> ${Math.round(data.discount * 100) / 100}`;
            
            // Keep the currency display
            row.querySelector('.currency').innerHTML = `<i class="fas fa-${currencyIcon}"></i> ${currency}`;

            // Update the original price in the row data attribute
            const newOriginalPrice = Math.round((data.totalPrice + data.discount) * 100) / 100;
            row.dataset.originalPrice = newOriginalPrice;

            // Replace the edit/save buttons with the original edit/delete buttons
            const actionsCell = row.querySelector('td:last-child');
            actionsCell.innerHTML = `
                <div class="actions-container">
                    <button class="editBtn" data-id="${id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="deleteBtn" data-id="${id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;

            // Add event listeners to the new buttons
            actionsCell.querySelector('.editBtn').addEventListener('click', editCalculation);
            actionsCell.querySelector('.deleteBtn').addEventListener('click', deleteCalculation);

            // Add a success animation
            row.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
            setTimeout(() => {
                row.style.backgroundColor = '';
                row.style.transition = 'background-color 1s ease';
            }, 300);

            showNotification('Calculation updated successfully');
        } catch (error) {
            console.error('Error updating calculation:', error);
            showNotification(error.message || 'Error updating calculation', 'error');
        }
    }

    function cancelEdit(row, originalTotalPrice, originalDiscount, currency, currencyIcon) {
        const id = row.dataset.id;
        
        // Restore the original values
        row.querySelector('.totalPrice').innerHTML = `${originalTotalPrice}`;
        row.querySelector('.discount').innerHTML = `<i class="fas fa-tag"></i> ${originalDiscount}`;
        
        // Keep the currency display
        row.querySelector('.currency').innerHTML = `<i class="fas fa-${currencyIcon}"></i> ${currency}`;

        // Replace the save/cancel buttons with the original edit/delete buttons
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.innerHTML = `
            <div class="actions-container">
                <button class="editBtn" data-id="${id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="deleteBtn" data-id="${id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;

        // Add event listeners to the new buttons
        actionsCell.querySelector('.editBtn').addEventListener('click', editCalculation);
        actionsCell.querySelector('.deleteBtn').addEventListener('click', deleteCalculation);

        // Reset the row styling
        row.style.backgroundColor = '';
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            ${message}
        `;
        
        if (type === 'error') {
            notification.style.background = 'rgba(255, 0, 0, 0.1)';
            notification.style.borderColor = 'rgba(255, 0, 0, 0.2)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
