window.addEventListener('DOMContentLoaded', function () {
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (!encodedData) {
            throw new Error('No data parameter found in the URL.');
        }

        // Decode and parse data
        const data = JSON.parse(atob(encodedData));

        // Validate essential fields
        if (!data.totalPrice || !data.totalCost) {
            throw new Error('Missing required price or cost data');
        }

        // Store data globally for recalculation
        window.calculationData = data;

        // Calculate P&L on page load
        calculatePL(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error: Unable to load calculation data.');
    }
});

function calculatePL(data) {
    // Revenue and COGS
    const revenue = data.totalPrice;
    const cogs = data.totalCost;

    // Gross Profit
    const grossProfit = revenue - cogs;

    // Operating Expenses (Editable)
    const operatingExpenses = parseFloat(document.getElementById('operating-expenses').value);

    // Operating Profit (EBIT)
    const operatingProfit = grossProfit - operatingExpenses;

    // Interest Expense (Editable)
    const interestExpense = parseFloat(document.getElementById('interest-expense').value);

    // Profit Before Tax
    const profitBeforeTax = operatingProfit - interestExpense;

    // Tax Percentage (Editable)
    const taxPercent = parseFloat(document.getElementById('tax-percent').value) / 100;

    // Validate tax percentage
    if (isNaN(taxPercent) || taxPercent < 0 || taxPercent > 1) {
        alert('Invalid tax percentage. Please enter a value between 0 and 100.');
        return;
    }

    // Calculate Taxes
    const taxesHST = profitBeforeTax * taxPercent;

    // Net Profit
    const netProfit = profitBeforeTax - taxesHST;

    // Profit Margin
    const profitMargin = (netProfit / revenue) * 100;

    // Update all DOM elements
    updateDOM('revenue', formatCurrency(revenue));
    updateDOM('cogs', formatCurrency(cogs));
    updateDOM('gross-profit', formatCurrency(grossProfit));
    updateDOM('operating-expenses', formatCurrency(operatingExpenses));
    updateDOM('operating-profit', formatCurrency(operatingProfit));
    updateDOM('interest-expense', formatCurrency(interestExpense));
    updateDOM('profit-before-tax', formatCurrency(profitBeforeTax));
    updateDOM('taxes-hst', formatCurrency(taxesHST));
    updateDOM('net-profit', formatCurrency(netProfit));
    updateDOM('profit-margin', `${profitMargin.toFixed(2)}%`);
}

function recalculatePL() {
    try {
        // Use the globally stored data
        const data = window.calculationData;

        if (!data) {
            throw new Error('No calculation data found.');
        }

        // Recalculate P&L
        calculatePL(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error: Unable to recalculate P&L.');
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Helper function to update DOM
function updateDOM(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}