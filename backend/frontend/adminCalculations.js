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
                            <th><i class="fas fa-tag"></i> Original Price</th>
                            <th><i class="fas fa-dollar-sign"></i> Total Price</th>
                            <th><i class="fas fa-percentage"></i> Discount</th>
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
                    <tr data-id="${calculation._id}" data-original-price="${originalPrice}">
                        <td><i class="fas fa-user-circle"></i> ${calculation.name}</td>
                        <td><i class="fas fa-building"></i> ${calculation.address}</td>
                        <td><i class="fas fa-globe"></i> ${calculation.country}</td>
                        <td>${calculation.totalSqFt}</td>
                        <td class="originalPrice"><i class="fas fa-${currencyIcon}"></i> ${originalPrice} ${currencyText}</td>
                        <td class="totalPrice"><i class="fas fa-${currencyIcon}"></i> ${totalPrice} ${currencyText}</td>
                        <td class="discount"><i class="fas fa-tag"></i> ${discount}</td>
                        <td><i class="far fa-calendar-alt"></i> ${formattedDate}</td>
                        <td><i class="fas fa-spray-can"></i> ${calculation.cleaningType}</td>
                        <td>
                            <button class="editBtn" data-id="${calculation._id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="deleteBtn" data-id="${calculation._id}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
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

        const totalPriceCell = row.querySelector('.totalPrice');
        const discountCell = row.querySelector('.discount');

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

        const editButtonsHTML = `
            <button class="saveBtn" data-id="${id}" data-original-price="${originalPrice}">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="cancelBtn" data-id="${id}">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;

        row.querySelector('td:last-child').innerHTML = editButtonsHTML;

        row.querySelector('.saveBtn').addEventListener('click', () => saveCalculation(id, row, originalPrice));
        row.querySelector('.cancelBtn').addEventListener('click', () => cancelEdit(row, originalTotalPrice, originalDiscount));

        // Add animation to the edited row
        row.style.backgroundColor = 'rgba(0, 255, 255, 0.05)';
    }

    async function saveCalculation(id, row, originalPrice) {
        const newDiscount = Math.round(parseFloat(row.querySelector('.editDiscount').value) * 100) / 100;
        const newTotalPrice = Math.round((originalPrice - newDiscount) * 100) / 100;
    
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
    
            row.querySelector('.totalPrice').textContent = Math.round(data.totalPrice * 100) / 100;
            row.querySelector('.discount').textContent = Math.round(data.discount * 100) / 100;
    
            const actionButtonsHTML = `
                <button class="editBtn" data-id="${id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="deleteBtn" data-id="${id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            `;
            row.querySelector('td:last-child').innerHTML = actionButtonsHTML;
    
            row.querySelector('.editBtn').addEventListener('click', editCalculation);
            row.querySelector('.deleteBtn').addEventListener('click', deleteCalculation);
    
            // Add success animation
            row.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 500);

            showNotification("Calculation updated successfully!", "success");
    
        } catch (error) {
            console.error("Error updating calculation:", error);
            showNotification(`Error updating calculation: ${error.message}`, "error");
        }
    }
    
    function cancelEdit(row, originalTotalPrice, originalDiscount) {
        row.querySelector('.totalPrice').textContent = originalTotalPrice;
        row.querySelector('.discount').textContent = originalDiscount;

        const id = row.dataset.id;
        const actionButtonsHTML = `
            <button class="editBtn" data-id="${id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="deleteBtn" data-id="${id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        `;
        row.querySelector('td:last-child').innerHTML = actionButtonsHTML;

        // Re-attach event listeners
        row.querySelector('.editBtn').addEventListener('click', editCalculation);
        row.querySelector('.deleteBtn').addEventListener('click', deleteCalculation);

        // Remove edit highlight
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
