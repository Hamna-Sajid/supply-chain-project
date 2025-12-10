// Check auth
if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const user = getCurrentUser();
if (user.role !== 'supplier') {
    redirectToDashboard(user.role);
}

if (document.getElementById('userName')) {
    document.getElementById('userName').textContent = user.name;
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'materials') {
        loadMaterials();
    } else if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'ratings') {
        loadRatings();
    } else if (tabName === 'expenses') {
        loadExpenses();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

async function addMaterial(event) {
    event.preventDefault();
    
    const material_name = document.getElementById('materialName').value;
    const unit_price = document.getElementById('unitPrice').value;
    const quantity_available = document.getElementById('quantity').value;
    const description = document.getElementById('description').value;
    
    try {
        await apiRequest('/supplier/materials', {
            method: 'POST',
            body: JSON.stringify({
                material_name,
                unit_price,
                quantity_available,
                description
            })
        });
        
        alert('Material added successfully!');
        event.target.reset();
        loadMaterials();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadMaterials() {
    showLoading('materialsList');
    
    try {
        const materials = await apiRequest('/supplier/materials');
        
        if (materials.length === 0) {
            document.getElementById('materialsList').innerHTML = '<p>No materials added yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(m => `
                        <tr>
                            <td>${m.material_name}</td>
                            <td>${m.description || 'N/A'}</td>
                            <td>${m.quantity_available}</td>
                            <td>${formatCurrency(m.unit_price)}</td>
                            <td>
                                <button class="btn btn-primary" onclick="editMaterial('${m.material_id}')">Edit</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('materialsList').innerHTML = html;
    } catch (error) {
        showError('materialsList', error.message);
    }
}

async function loadOrders() {
    showLoading('ordersList');
    
    try {
        const orders = await apiRequest('/supplier/orders');
        
        if (orders.length === 0) {
            document.getElementById('ordersList').innerHTML = '<p>No orders yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>${o.order_id.substring(0, 8)}...</td>
                            <td>${o.ordered_by_name}</td>
                            <td>${formatDate(o.order_date)}</td>
                            <td>${formatCurrency(o.total_amount)}</td>
                            <td><span class="badge badge-${o.order_status}">${o.order_status}</span></td>
                            <td>
                                <select onchange="updateOrderStatus('${o.order_id}', this.value)">
                                    <option value="">Update Status</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('ordersList').innerHTML = html;
    } catch (error) {
        showError('ordersList', error.message);
    }
}

async function updateOrderStatus(orderId, status) {
    if (!status) return;
    
    try {
        await apiRequest(`/supplier/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        alert('Order status updated!');
        loadOrders();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadRatings() {
    showLoading('ratingsList');
    
    try {
        const data = await apiRequest('/supplier/ratings');
        
        const html = `
            <div style="margin-bottom: 20px;">
                <h3>Average Rating: ${parseFloat(data.average).toFixed(1)} ⭐ (${data.total} reviews)</h3>
            </div>
            ${data.ratings.length === 0 ? '<p>No ratings yet.</p>' : `
                <table>
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.ratings.map(r => `
                            <tr>
                                <td>${r.rater_name}</td>
                                <td>${'⭐'.repeat(r.rating_value)}</td>
                                <td>${r.review || 'No review'}</td>
                                <td>${formatDate(r.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        `;
        
        document.getElementById('ratingsList').innerHTML = html;
    } catch (error) {
        showError('ratingsList', error.message);
    }
}

async function loadAnalytics() {
    try {
        const analytics = await apiRequest('/supplier/dashboard');
        
        if (document.getElementById('totalRevenue')) {
            document.getElementById('totalRevenue').textContent = formatCurrency(analytics.totalRevenue);
        }
        if (document.getElementById('totalExpense')) {
            document.getElementById('totalExpense').textContent = formatCurrency(analytics.totalExpense);
        }
        if (document.getElementById('netProfit')) {
            document.getElementById('netProfit').textContent = formatCurrency(analytics.netProfit);
        }
        if (document.getElementById('avgRating')) {
            document.getElementById('avgRating').textContent = analytics.avgRating;
        }
        
        // Load financial records from analytics
        try {
            const revenue = await apiRequest('/analytics/revenue');
            const expense = await apiRequest('/analytics/expense');
            
            const html = `
                <h3>Recent Revenue</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Order ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${revenue.slice(0, 10).map(r => `
                            <tr>
                                <td>${formatDate(r.revenue_update_date)}</td>
                                <td>${formatCurrency(r.amount)}</td>
                                <td>${r.order_id ? r.order_id.substring(0, 8) + '...' : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            if (document.getElementById('financialRecords')) {
                document.getElementById('financialRecords').innerHTML = html;
            }
        } catch (error) {
            console.log('Analytics financial data not available');
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// Expenses functions
async function addExpense(event) {
    event.preventDefault();
    
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    
    try {
        await apiRequest('/analytics/expense', {
            method: 'POST',
            body: JSON.stringify({ amount, category })
        });
        
        alert('Expense added successfully!');
        event.target.reset();
        loadExpenses();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadExpenses() {
    showLoading('expensesList');
    
    try {
        const expenses = await apiRequest('/analytics/expense');
        
        if (expenses.length === 0) {
            document.getElementById('expensesList').innerHTML = '<p>No expenses recorded.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(e => `
                        <tr>
                            <td>${formatDate(e.expense_update_date)}</td>
                            <td>${formatCurrency(e.amount)}</td>
                            <td>${e.category || 'N/A'}</td>
                            <td>${e.order_id ? 'Order-related' : 'Manual'}</td>
                            <td>
                                ${!e.order_id ? `
                                    <button class="btn btn-primary" onclick="editExpense('${e.expense_id}', ${e.amount}, '${e.category || ''}')">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteExpense('${e.expense_id}')">Delete</button>
                                ` : 'N/A'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('expensesList').innerHTML = html;
    } catch (error) {
        showError('expensesList', error.message);
    }
}

function editExpense(expenseId, amount, category) {
    const newAmount = prompt('Enter new amount:', amount);
    if (newAmount === null) return;
    
    const newCategory = prompt('Enter new category:', category);
    if (newCategory === null) return;
    
    updateExpense(expenseId, newAmount, newCategory);
}

async function updateExpense(expenseId, amount, category) {
    try {
        await apiRequest(`/analytics/expense/${expenseId}`, {
            method: 'PUT',
            body: JSON.stringify({ amount, category })
        });
        
        alert('Expense updated successfully!');
        loadExpenses();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        await apiRequest(`/analytics/expense/${expenseId}`, {
            method: 'DELETE'
        });
        
        alert('Expense deleted successfully!');
        loadExpenses();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadDashboardData() {
    try {
        const data = await apiRequest('/supplier/dashboard');
        
        document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
        document.getElementById('totalExpense').textContent = formatCurrency(data.totalExpense);
        document.getElementById('netProfit').textContent = formatCurrency(data.netProfit);
        document.getElementById('avgRating').textContent = data.avgRating;
        document.getElementById('totalRatings').textContent = `(${data.totalRatings} reviews)`;
        document.getElementById('pendingOrdersCount').textContent = data.pendingOrders;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function generateFinancialChart() {
    try {
        // This would generate revenue vs expense trend data
        // In real implementation, this would fetch historical data from analytics endpoints
        const revenueData = await apiRequest('/analytics/revenue');
        const expenseData = await apiRequest('/analytics/expense');
        
        // Group by month and prepare chart data
        const chartData = groupDataByMonth(revenueData, expenseData);
        renderFinancialChart(chartData);
    } catch (error) {
        console.error('Error generating chart:', error);
    }
}

function groupDataByMonth(revenue, expense) {
    // Group revenue and expense by month for chart display
    const monthData = {};
    
    revenue.forEach(r => {
        const date = new Date(r.revenue_update_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthData[monthKey]) monthData[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
        monthData[monthKey].revenue += r.amount;
    });
    
    expense.forEach(e => {
        const date = new Date(e.expense_update_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthData[monthKey]) monthData[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
        monthData[monthKey].expense += e.amount;
    });
    
    return Object.values(monthData).sort((a, b) => a.month.localeCompare(b.month));
}

function renderFinancialChart(data) {
    // This function would render a chart using a charting library
    // For now, just log the data
    console.log('Financial chart data:', data);
}

async function generateMaterialStockChart() {
    try {
        const materials = await apiRequest('/supplier/materials/stock/overview');
        // Materials data is ready for chart rendering
        console.log('Material stock data:', materials);
    } catch (error) {
        console.error('Error generating material chart:', error);
    }
}

async function loadPendingOrders() {
    showLoading('pendingOrdersList');
    
    try {
        const orders = await apiRequest('/supplier/orders/pending');
        
        if (orders.length === 0) {
            document.getElementById('pendingOrdersList').innerHTML = '<p>No pending orders.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Manufacturer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>${o.order_id.substring(0, 8)}...</td>
                            <td>${o.manufacturer_name}</td>
                            <td>${formatCurrency(o.total_amount)}</td>
                            <td><span class="badge badge-${o.order_status}">${o.order_status}</span></td>
                            <td>${formatDate(o.order_date)}</td>
                            <td>
                                <button class="btn btn-primary" onclick="showOrderDetails('${o.order_id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('pendingOrdersList').innerHTML = html;
    } catch (error) {
        showError('pendingOrdersList', error.message);
    }
}

async function showOrderDetails(orderId) {
    try {
        // Fetch detailed order information
        const orders = await apiRequest('/supplier/orders');
        const order = orders.find(o => o.order_id === orderId);
        
        if (order) {
            alert(`Order Details:\nID: ${order.order_id}\nCustomer: ${order.ordered_by_name}\nAmount: ${formatCurrency(order.total_amount)}\nStatus: ${order.order_status}`);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Load notifications (simulated for now)
function loadNotifications() {
    // This would typically fetch from a notifications endpoint
    const notifications = [
        { id: 1, message: 'New order from ABC Manufacturing', time: '2 hours ago' },
        { id: 2, message: '5-star rating received from XYZ Industries', time: '4 hours ago' },
        { id: 3, message: 'Order ORD-001 delivery confirmed', time: '1 day ago' },
        { id: 4, message: 'Payment received for ORD-425', time: '2 days ago' },
    ];
    
    const html = notifications.map(n => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <p style="font-weight: bold; margin: 0;">${n.message}</p>
            <p style="font-size: 0.85em; color: #666; margin: 5px 0 0 0;">${n.time}</p>
        </div>
    `).join('');
    
    if (document.getElementById('notificationsList')) {
        document.getElementById('notificationsList').innerHTML = html;
    }
}

// Initial load
loadMaterials();
loadDashboardData();
loadPendingOrders();
loadNotifications();