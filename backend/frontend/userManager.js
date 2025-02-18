document.addEventListener('DOMContentLoaded', function() {
    const userTableBody = document.getElementById('userTableBody');

    async function fetchUsers() {
        try {
            const response = await fetch('/api/userManager/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function displayUsers(users) {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.username}</td>
                <td>${user.country}</td>
                <td><button onclick="deleteUser('${user._id}')">Delete</button></td>
            `;
            userTableBody.appendChild(row);
        });
    }

    window.deleteUser = async function(userId) {
        try {
            const response = await fetch(`/api/userManager/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                fetchUsers(); // Refresh the user list
            } else {
                console.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    fetchUsers();
});
