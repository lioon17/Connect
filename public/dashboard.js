    


document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".d-sidebar");
    const toggleButton = document.querySelector(".d-sidebar-toggle");
    const closeButton = document.querySelector(".d-close-btn");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("d-open");
    });

    closeButton.addEventListener("click", () => {
        sidebar.classList.remove("d-open");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".d-sidebar-menu a");
    const sections = document.querySelectorAll("section");

    links.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Get the target section ID from the data attribute
            const targetSection = link.getAttribute("data-section");

            // Hide all sections
            sections.forEach(section => {
                section.style.display = "none";
            });

            // Show the target section
            document.getElementById(targetSection).style.display = "block";

            // Optional: Highlight the active link
            links.forEach(l => l.classList.remove("d-active"));
            link.classList.add("d-active");
        });
    });
});


async function fetchCustomerInsights() {
    try {
        // Fetch data from the API
        const response = await fetch('/api/customer-insights');
        const data = await response.json();

        // Update the DOM with fetched data
        document.getElementById('newCustomers').innerText = data.newCustomers;
        document.getElementById('totalCustomers').innerText = data.totalCustomers;

        // Update the Returning vs. New Customers chart
        const customerChart = Chart.getChart('customerChart'); // Fetch existing chart instance
        if (customerChart) {
            // Update existing chart
            customerChart.data.datasets[0].data = data.newCustomers; // Assuming API returns detailed data per month
            customerChart.data.datasets[1].data = data.returningCustomers;
            customerChart.update();
        }
    } catch (error) {
        console.error('Error fetching customer insights:', error);
        // Handle error display (optional)
    }
}

// Call fetch function on page load
fetchCustomerInsights();
const customerCtx = document.getElementById('customerChart').getContext('2d');
new Chart(customerCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Update dynamically if needed
        datasets: [
            {
                label: 'New Customers',
                data: [], // Placeholder; will update dynamically
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Returning Customers',
                data: [], // Placeholder; will update dynamically
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Function to fetch and update total curtains sales
async function updateCurtainsSales() {
    try {
        const response = await fetch('/api/curtains/total-sales');
        const data = await response.json();
        document.getElementById('curtainsSales').textContent = `Ksh${parseFloat(data.totalSales).toFixed(2)}`;
    } catch (error) {
        console.error('Error fetching curtains sales:', error);
    }
}
// Function to fetch and update category sales
async function updateCategorySales() {
    try {
        const response = await fetch('/api/sales-by-category');
        const data = await response.json();

        // Reset sales values to 0 before updating
        const categoryElements = {
            womenClothingSales: 0,
            menClothingSales: 0,
            menShoesSales: 0,
            womenShoesSales: 0,
            sheersSales: 0,
        
        };

        // Update category sales based on API response
        data.forEach(item => {
            switch (item.category.toLowerCase()) {
                case 'dresses': // Map 'dresses' to Women's Clothing Sales
                    categoryElements.womenClothingSales = parseFloat(item.totalSales);
                    break;
                case 'shoes': // Map 'shoes' to Women's Shoes Sales
                    categoryElements.womenShoesSales = parseFloat(item.totalSales);
                    break;
                case 'sheers':
                    categoryElements.sheersSales = parseFloat(item.totalSales);
                    break;
                default:
                    console.warn('Unknown category:', item.category);
            }
        });

        // Update the DOM
        for (const [id, value] of Object.entries(categoryElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `Ksh ${value.toFixed(2)}`;
            } else {
                console.warn(`Element with ID '${id}' not found in the HTML.`);
            }
        }
    } catch (error) {
        console.error('Error fetching sales by category:', error);
    }
}

// Function to start the updates
function startSalesUpdates() {
    updateCurtainsSales();
    updateCategorySales();

    // Refresh every 5 seconds
    setInterval(() => {
        updateCurtainsSales();
        updateCategorySales();
    }, 5000);
}

// Start updating sales insights
startSalesUpdates();


// Function to fetch and update both Donut and Bar Charts
async function updateSalesCharts() {
    try {
        // Fetch Curtain Sales
        const curtainSalesResponse = await fetch('/api/curtains/total-sales');
        const curtainSalesData = await curtainSalesResponse.json();

        // Fetch Category Sales
        const categorySalesResponse = await fetch('/api/sales-by-category');
        const categorySalesData = await categorySalesResponse.json();

        // Prepare the data for both charts
        const labels = ['Curtains']; // Start with Curtains
        const values = [parseFloat(curtainSalesData.totalSales)]; // Start with Curtains Sales

        // Add category sales data
        categorySalesData.forEach(item => {
            labels.push(item.category);
            values.push(parseFloat(item.totalSales));
        });

        // Update the Donut Chart
        salesByCategoryDonutChart.data.labels = labels;
        salesByCategoryDonutChart.data.datasets[0].data = values;
        salesByCategoryDonutChart.update();

        // Update the Bar Chart
        salesByCategoryBarChart.data.labels = labels;
        salesByCategoryBarChart.data.datasets[0].data = values;
        salesByCategoryBarChart.update();

    } catch (error) {
        console.error('Error updating sales charts:', error);
    }
}

// Initialize Donut Chart
const salesByCategoryDonutCtx = document.getElementById('salesByCategoryDonutChart').getContext('2d');
const salesByCategoryDonutChart = new Chart(salesByCategoryDonutCtx, {
    type: 'doughnut',
    data: {
        labels: [], // Will be updated dynamically
        datasets: [{
            data: [],
            backgroundColor: [
                'rgb(255, 99, 132)',   // Red
                'rgb(54, 162, 235)',   // Blue
                'rgb(255, 205, 86)',   // Yellow
                'rgb(75, 192, 192)',   // Green
                'rgb(153, 102, 255)',  // Purple
                'rgb(255, 159, 64)'    // Orange
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Initialize Bar Chart
const salesByCategoryBarCtx = document.getElementById('salesByCategoryBarChart').getContext('2d');
const salesByCategoryBarChart = new Chart(salesByCategoryBarCtx, {
    type: 'bar',
    data: {
        labels: [], // Will be updated dynamically
        datasets: [{
            label: 'Total Sales',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Real-time updates every 5 seconds
setInterval(updateSalesCharts, 5000);

// Initial load
updateSalesCharts();

// Function to fetch and update real-time purchase
async function updateRealTimePurchase() {
    try {
        const response = await fetch('/api/real-time-purchase');
        const data = await response.json();

        if (data.message) {
            document.getElementById('latestPurchase').textContent = 'No recent purchases.';
        } else {
            const purchaseDetails = `
                Latest Purchase: ${data.orderType} - ${data.productTitle}, 
                Quantity: ${data.quantity || 'N/A'}, 
                Total: $${data.totalAmount}, 
                Phone: ${data.phoneNumber}, 
                Date: ${new Date(data.orderDate).toLocaleString()}
            `;

            document.getElementById('latestPurchase').textContent = purchaseDetails;
        }
    } catch (error) {
        console.error('Error fetching real-time purchase update:', error);
    }
}

// Refresh real-time purchase every 5 seconds
setInterval(updateRealTimePurchase, 5000);

// Initial load
updateRealTimePurchase();

// Function to fetch and display top-selling and low-selling products
async function updateTopSellingProducts() {
    try {
        console.log('Fetching top-selling products...');
        const response = await fetch('/api/top-selling-products');
        const data = await response.json();

        // Get the list elements
        const topSellingList = document.getElementById('topSellingProducts');
        const lowSellingList = document.getElementById('lowSellingProducts');

        // Clear the lists
        topSellingList.innerHTML = '';
        lowSellingList.innerHTML = '';

        // Populate Top-Selling Products (first two items)
        const topProducts = data.slice(0, 2);
        topProducts.forEach(product => {
            const listItem = document.createElement('li');
            if (product.totalQuantitySold) {
                listItem.textContent = `${product.productTitle} - ${product.totalQuantitySold} units sold`;
            } else if (product.totalWidthSold) {
                const width = parseFloat(product.totalWidthSold);
                listItem.textContent = `${product.productTitle} - ${width.toFixed(2)} meters sold`;
            }
            topSellingList.appendChild(listItem);
        });

        // Populate Low-Selling Products (last two items)
        const lowProducts = data.slice(-2);
        lowProducts.forEach(product => {
            const listItem = document.createElement('li');
            if (product.totalQuantitySold) {
                listItem.textContent = `${product.productTitle} - ${product.totalQuantitySold} units sold`;
            } else if (product.totalWidthSold) {
                const width = parseFloat(product.totalWidthSold);
                listItem.textContent = `${product.productTitle} - ${width.toFixed(2)} meters sold`;
            }
            lowSellingList.appendChild(listItem);
        });

        console.log('Top-selling and low-selling products updated successfully.');
    } catch (error) {
        console.error('Error fetching top-selling products:', error);
    }
}

// Initial load
updateTopSellingProducts();


const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
const addProductForm = document.getElementById('addProductForm');

// Fetch products from the server
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        renderProductTable(data.products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Render product table dynamically
function renderProductTable(products) {
    productTable.innerHTML = '';
    products.forEach(product => {
        const row = productTable.insertRow();
        row.innerHTML = `
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td>
                <input type="number" value="${product.price}" onchange="updateProduct(${product.id}, 'price', this.value)">
            </td>
            <td>
              <div class="cart-item-actions">
                <button  onclick="updateStock(${product.id}, 'increase', 1)">+</button>
                  ${product.stock_quantity}
                <button   onclick="updateStock(${product.id}, 'decrease', 1)">-</button>
                </div>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
    });
}

// Add a new product
addProductForm.onsubmit = async function (e) {
    e.preventDefault();
    const title = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock_quantity = parseInt(document.getElementById('productStock').value);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, price, stock_quantity })
        });
        const data = await response.json();
        if (response.ok) {
            fetchProducts(); // Reload the product list
            this.reset();
        } else {
            console.error('Error adding product:', data.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
};

// Update a product field
async function updateProduct(id, field, value) {
    try {
        const payload = { [field]: value };
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Error updating product:', data.message);
        }
    } catch (error) {
        console.error('Error updating product:', error);
    }
}

// Delete a product
async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok) {
            fetchProducts(); // Reload the product list
        } else {
            console.error('Error deleting product:', data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Load products on page load
fetchProducts();


// Update stock quantity
async function updateStock(id, action, amount) {
    try {
        const endpoint = action === 'increase'
            ? `/api/products/increase-stock/${id}`
            : `/api/products/decrease-stock/${id}`;

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(data.message);
            fetchProducts(); // Reload the product list
        } else {
            console.error('Error updating stock:', data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Error updating stock:', error);
    }
}


const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const orderTableBody = document.getElementById('orderTableBody');

// Orders fetched from the server
let orders = [];

// Fetch orders from the server
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        const data = await response.json();

        if (response.ok) {
            orders = data.orders.map(order => ({
                id: order.order_id,
                customer: order.customer_name,
                items: order.items,
                total: `$${parseFloat(order.total_amount).toFixed(2)}`,
                status: order.order_status,
                date: new Date(order.order_date).toLocaleDateString()
            }));
            renderOrders();
        } else {
            console.error('Error fetching orders:', data.message);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}
// Determine the next status based on the current status
function getNextStatus(currentStatus) {
    switch (currentStatus) {
        case 'processing':
            return 'shipped';
        case 'shipped':
            return 'delivered';
        default:
            return 'cancelled'; // Default action for final state
    }
}

// Determine the button label based on the current status
function getNextActionLabel(currentStatus) {
    switch (currentStatus) {
        case 'processing':
            return 'Ship';
        case 'shipped':
            return 'Deliver';
        case 'delivered':
            return 'Cancel';
        default:
            return 'Cancel'; // Default action for final state
    }
}

// Update order status and re-render the table
function updateOrderStatus(orderId, newStatus) {
    orders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    renderOrders();
}

// Render orders in the table dynamically
function renderOrders() {
    const filteredOrders = orders
        .filter(order =>
            order.customer.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            order.items.toLowerCase().includes(searchInput.value.toLowerCase())
        )
        .filter(order => statusFilter.value === 'all' ? true : order.status === statusFilter.value)
        .sort((a, b) => {
            if (sortBy.value === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else {
                return parseFloat(b.total.replace('$', '')) - parseFloat(a.total.replace('$', ''));
            }
        });

    orderTableBody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.items}</td>
            <td>${order.total}</td>
            <td><span class="badge badge-${order.status}">${order.status}</span></td>
            <td>${order.date}</td>
            <td>
                <button class="button-status ${order.status}" 
                        onclick="updateOrderStatus(${order.id}, '${getNextStatus(order.status)}')">
                    ${getNextActionLabel(order.status)}
                </button>
            </td>
        </tr>
    `).join('');
}

 

// Update order status
function updateOrderStatus(orderId, newStatus) {
    orders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    renderOrders();
}

// Cancel order
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        orders = orders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
        );
        renderOrders();
    }
}

// Event listeners for filters and sorting
searchInput.addEventListener('input', renderOrders);
statusFilter.addEventListener('change', renderOrders);
sortBy.addEventListener('change', renderOrders);

// Fetch and render orders on page load
fetchOrders();


async function updateOrderStatus(orderId, newStatus) {
    try {
        // Send a PUT request to update the order status in the database
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (response.ok) {
            // Update the local orders array and re-render the table
            orders = orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            renderOrders();
            alert(data.message); // Optional: Notify the user
        } else {
            console.error('Failed to update status:', data.message);
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('An error occurred while updating the order status.');
    }
}



// Fetch transactions from the server
async function fetchTransactions() {
    try {
        const response = await fetch('/mpesa-transactions');
        const data = await response.json();

        if (response.ok) {
            transactions = data.map(transaction => ({
                  // Assuming there's an 'id' field
                receipt: transaction.MpesaReceiptNumber || 'N/A',
                amount: `$${parseFloat(transaction.Amount).toFixed(2)}`,
                phone: transaction.PhoneNumber,
                date: new Date(transaction.TransactionDate).toLocaleDateString()
            }));
            renderTransactions();
        } else {
            console.error('Error fetching transactions:', data.message);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

// Render transactions in the table dynamically
function renderTransactions() {
    const filteredTransactions = transactions
        .filter(transaction =>
            transaction.receipt.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            transaction.phone.includes(searchInput.value)
        )
        .sort((a, b) => {
            if (sortBy.value === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else {
                return parseFloat(b.amount.replace('$', '')) - parseFloat(a.amount.replace('$', ''));
            }
        });

    transactionTableBody.innerHTML = filteredTransactions.map(transaction => `
        <tr>
            <td>${transaction.receipt}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.phone}</td>
            <td>${transaction.date}</td>
        </tr>
    `).join('');
}

// Event listeners for filters
document.getElementById('searchInput').addEventListener('input', renderTransactions);
document.getElementById('sortBy').addEventListener('change', renderTransactions);

// Load transactions on page load
document.addEventListener('DOMContentLoaded', fetchTransactions);



/*weekly sales*/
// Function to fetch and display sales trends
async function updateSalesTrends() {
    try {
        const response = await fetch('/sales-trends');
        const data = await response.json();

        // Extract labels (weeks) and data (sales amounts)
        const labels = data.map(entry => `Week ${entry.week.substring(4)}`); // Extracts week number
        const salesData = data.map(entry => parseFloat(entry.totalSales));

        // Update the chart
        salesTrendsChart.data.labels = labels;
        salesTrendsChart.data.datasets[0].data = salesData;
        salesTrendsChart.update();
    } catch (error) {
        console.error('Error fetching sales trends:', error);
    }
}

// Initialize chart
const salesTrendsCtx = document.getElementById('salesTrendsChart').getContext('2d');
const salesTrendsChart = new Chart(salesTrendsCtx, {
    type: 'line',
    data: {
        labels: [], // Will be updated dynamically
        datasets: [{
            label: 'Weekly Sales',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Fetch and update sales trends on page load
updateSalesTrends();


/*category number of items sold*/
// Function to fetch and update category performance chart
async function updateCategoryPerformance() {
    try {
        const response = await fetch('/category-performance');
        const data = await response.json();

        // Extract labels (categories) and data (total sales)
        const labels = data.map(entry => entry.category);
        const salesData = data.map(entry => entry.totalSold);

        // Update the chart
        categoryPerformanceChart.data.labels = labels;
        categoryPerformanceChart.data.datasets[0].data = salesData;
        categoryPerformanceChart.update();
    } catch (error) {
        console.error('Error fetching category performance:', error);
    }
}

// Initialize chart
const categoryPerformanceCtx = document.getElementById('categoryPerformanceChart').getContext('2d');
const categoryPerformanceChart = new Chart(categoryPerformanceCtx, {
    type: 'bar',
    data: {
        labels: [], // Will be updated dynamically
        datasets: [{
            label: 'Total Sold Items',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Fetch and update the category performance on page load
updateCategoryPerformance();





document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', { method: 'GET' });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            window.location.href = '/login'; // Redirect to login page
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
});
