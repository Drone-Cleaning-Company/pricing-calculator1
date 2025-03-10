document.addEventListener('DOMContentLoaded', function() {
    const userTableBody = document.getElementById('userTableBody');

    async function fetchUsers() {
        try {
            const response = await fetch('/api/userManager/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('Error fetching users. Please try again.', 'error');
        }
    }

    function displayUsers(users) {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><i class="fas fa-user-circle"></i> ${user.name}</td>
                <td><i class="fas fa-envelope"></i> ${user.email}</td>
                <td><i class="fas fa-user-tag"></i> ${user.username}</td>
                <td><i class="fas fa-globe"></i> ${user.country}</td>
                <td>
                    <button class="delete-btn" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);

            // Add hover animation to the row
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'translateX(5px)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'translateX(0)';
            });
        });
    }

    window.deleteUser = async function(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/userManager/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Find and remove the row with animation
            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            if (row) {
                row.style.transform = 'translateX(100%)';
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            }

            showNotification('User deleted successfully', 'success');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user. Please try again.', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initial fetch
    fetchUsers();
});
