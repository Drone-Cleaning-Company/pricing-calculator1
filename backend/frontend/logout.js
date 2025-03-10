// frontend/logout.js
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Add click animation
                logoutBtn.classList.add('clicked');
                
                // Show loading state
                const originalContent = logoutBtn.innerHTML;
                logoutBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Logging out...
                `;

                try {
                    // Attempt to logout from server
                    const response = await fetch('/api/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                } catch (serverError) {
                    console.warn('Server logout failed, proceeding with local logout:', serverError);
                }

                // Save cost settings before clearing localStorage
                const otherCosts = localStorage.getItem('otherCosts');
                const operationalCosts = localStorage.getItem('operationalCosts');

                // Clear only authentication-related data
                localStorage.removeItem('token');
                localStorage.removeItem('name');
                localStorage.removeItem('country');
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('username');
                localStorage.removeItem('savedCalculation');
                localStorage.removeItem('calculationResults');
                localStorage.removeItem('clientName');
                localStorage.removeItem('address');
                localStorage.removeItem('totalSqFt');

                // Restore cost settings
                if (otherCosts) localStorage.setItem('otherCosts', otherCosts);
                if (operationalCosts) localStorage.setItem('operationalCosts', operationalCosts);

                // Show success animation
                logoutBtn.innerHTML = `
                    <i class="fas fa-check"></i>
                    Success!
                `;
                logoutBtn.classList.add('success');

                // Redirect after showing success message
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 800);

            } catch (error) {
                console.error('Logout error:', error);
                
                // Show error state briefly
                logoutBtn.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    Error, retrying...
                `;
                logoutBtn.classList.add('error');

                // Still clear authentication data and redirect
                setTimeout(() => {
                    // Save cost settings before clearing localStorage
                    const otherCosts = localStorage.getItem('otherCosts');
                    const operationalCosts = localStorage.getItem('operationalCosts');

                    // Clear only authentication-related data
                    localStorage.removeItem('token');
                    localStorage.removeItem('name');
                    localStorage.removeItem('country');
                    localStorage.removeItem('isAdmin');
                    localStorage.removeItem('username');
                    localStorage.removeItem('savedCalculation');
                    localStorage.removeItem('calculationResults');
                    localStorage.removeItem('clientName');
                    localStorage.removeItem('address');
                    localStorage.removeItem('totalSqFt');

                    // Restore cost settings
                    if (otherCosts) localStorage.setItem('otherCosts', otherCosts);
                    if (operationalCosts) localStorage.setItem('operationalCosts', operationalCosts);

                    window.location.href = '/index.html';
                }, 1000);
            } finally {
                // Remove click animation
                setTimeout(() => {
                    logoutBtn.classList.remove('clicked');
                }, 200);
            }
        });
    }
});
