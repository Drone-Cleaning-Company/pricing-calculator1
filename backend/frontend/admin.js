// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Function to format square footage
function formatSqFt(sqft) {
    return new Intl.NumberFormat('en-US').format(sqft) + ' sq ft';
}

// Function to update user info
function updateUserInfo() {
    const userName = localStorage.getItem('name');
    const userCountry = localStorage.getItem('country');
    console.log('Raw values from localStorage:', { userName, userCountry });
    
    if (!userName) {
        console.error('No user name found in localStorage');
        window.location.href = '/index.html';
        return;
    }
    
    const userNameElement = document.getElementById('userName');
    const userCountryElement = document.getElementById('userCountry');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
        console.log('Set user name to:', userName);
    }
    
    if (userCountryElement) {
        // For admin users, show their specific country or "All Countries" if they have access to all
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        let countryToDisplay;
        
        if (isAdmin) {
            // If admin has a specific country, show it, otherwise show "All Countries"
            countryToDisplay = userCountry && userCountry !== 'undefined' && userCountry !== 'null' ? userCountry : 'All Countries';
        } else {
            // For regular users, always show their country
            countryToDisplay = userCountry || 'USA';
        }
        
        userCountryElement.textContent = countryToDisplay;
        console.log('Set country to:', countryToDisplay, '(Admin:', isAdmin, ')');
    } else {
        console.error('Country element not found');
    }
}

// Function to load recent calculations
async function loadRecentCalculations() {
    try {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (!token || !isAdmin) {
            window.location.href = '/login.html';
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Fetch all calculations
        const calculationsResponse = await fetch('/api/calculations/all', { headers });
        if (!calculationsResponse.ok) {
            throw new Error('Failed to fetch calculations');
        }
        const calculations = await calculationsResponse.json();

        // Fetch user count
        const usersResponse = await fetch('/api/userManager/count', { headers });
        if (!usersResponse.ok) {
            throw new Error('Failed to fetch user count');
        }
        const userData = await usersResponse.json();

        // Calculate totals
        let totalRevenue = 0;
        calculations.forEach(calc => {
            if (calc.totalPrice) totalRevenue += parseFloat(calc.totalPrice);
        });

        // Update overview stats
        document.getElementById('totalCalculations').textContent = formatNumber(calculations.length);
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('totalUsers').textContent = formatNumber(userData.count);

        // Update recent calculations
        const container = document.getElementById('recentCalculations');
        const template = document.getElementById('calculationTemplate');
        
        if (!template || !container) {
            console.error('Required DOM elements not found');
            return;
        }

        container.innerHTML = ''; // Clear existing cards
        const recentCalcs = calculations.slice(0, 6); // Show 6 most recent calculations

        recentCalcs.forEach((calc, index) => {
            const card = template.content.cloneNode(true);
            
            // Set calculation title
            card.querySelector('.project-title').textContent = `Calculation #${calculations.length - index}`;
            
            // Set calculation details
            card.querySelector('.client-name').textContent = calc.name || 'N/A';
            card.querySelector('.square-footage').textContent = formatSqFt(calc.totalSqFt || 0);
            card.querySelector('.total-price').textContent = formatCurrency(calc.totalPrice || 0);
            card.querySelector('.country').textContent = calc.country || 'N/A';
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading calculations:', error);
        // Show error message
        const container = document.getElementById('recentCalculations');
        if (container) {
            container.innerHTML = `
                <div class="project-card" style="text-align: center; padding: 2rem;">
                    <div class="project-icon" style="margin: 0 auto 1rem;">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="project-title" style="color: #ff3b30;">Error Loading Calculations</div>
                    <div class="project-details">
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();
    loadRecentCalculations();
    
    // Setup logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }

    // Add menu toggle functionality for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
});
