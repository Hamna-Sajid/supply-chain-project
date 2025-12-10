if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const user = getCurrentUser();
if (user.role !== 'warehouse_manager') {
    redirectToDashboard(user.role);
}

document.getElementById('userName').textContent = user.name;

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'shipments') loadShipments();
    else if (tabName === 'inventory') loadInventory();
    else if (tabName === 'orders') loadOrders();
    else if (tabName === 'alerts') loadLowStockAlerts();
    else if (tabName === 'analytics') loadAnalytics();
}

async function loadShipments() {
    showLoading('shipmentsList');

    try {
        const shipments = await apiRequest('/warehouse/shipments');

        if (shipments.length === 0) {
            document.getElementById('shipmentsList').innerHTML = '<p>No incoming shipments.</p>';
            return;
        }

        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Shipment ID</th>
                        <th>Product</th>
                        <th>Manufacturer</th>
                        <th>Rating</th>
                        <th>Expected</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${shipments.map(s => `
                        <tr>
                            <td>${s.shipment_id.substring(0, 8)}...</td>
                            <td>${s.product_name}</td>
                            <td>${s.manufacturer_name}</td>
                            <td>${parseFloat(s.manufacturer_rating || 0).toFixed(1)} ⭐</td>
                            <td>${formatDate(s.expected_delivery_date)}</td>
                            <td><span class="badge badge-${s.status}">${s.status}</span></td>
                            <td>
                                <select onchange="updateShipmentStatus('${s.shipment_id}', this.value)">
                                    <option value="">Update Status</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="delayed">Delayed</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('shipmentsList').innerHTML = html;
    } catch (error) {
        showError('shipmentsList', error.message);
    }
}

async function updateShipmentStatus(shipmentId, status) {
    if (!status) return;

    try {
        await apiRequest(`/warehouse/shipments/${shipmentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        alert('Shipment status updated!');
        loadShipments();
        if (status === 'delivered') {
            loadInventory();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadInventory() {
    showLoading('inventoryList');

    try {
        const inventory = await apiRequest('/warehouse/inventory');

        if (inventory.length === 0) {
            document.getElementById('inventoryList').innerHTML = '<p>No inventory items.</p>';
            return;
        }

        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Cost Price</th>
                        <th>Selling Price</th>
                        <th>Reorder Level</th>
                        <th>Last Restocked</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventory.map(i => `
                        <tr>
                            <td>${i.product_name}</td>
                            <td>${i.category || 'N/A'}</td>
                            <td>${i.quantity_available}${i.quantity_available < i.reorder_level ? ' ' : ''}</td>
                            <td>${formatCurrency(i.cost_price)}</td>
                            <td>${formatCurrency(i.selling_price)}</td>
                            <td>${i.reorder_level}</td>
                            <td>${formatDate(i.last_restocked)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('inventoryList').innerHTML = html;
    } catch (error) {
        showError('inventoryList', error.message);
    }
}

async function loadOrders() {
    showLoading('ordersList');

    try {
        const orders = await apiRequest('/warehouse/orders');

        if (orders.length === 0) {
            document.getElementById('ordersList').innerHTML = '<p>No orders yet.</p>';
            return;
        }

        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Retailer</th>
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
                            <td>${o.retailer_name}</td>
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
        await apiRequest(`/warehouse/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        alert('Order status updated!');
        loadOrders();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadLowStockAlerts() {
    showLoading('alertsList');

    try {
        const alerts = await apiRequest('/warehouse/low-stock');

        if (alerts.length === 0) {
            document.getElementById('alertsList').innerHTML = '<p class="success-message">All items are well-stocked!</p>';
            return;
        }

        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Alert</th>
                    </tr>
                </thead>
                <tbody>
                    ${alerts.map(a => `
                        <tr style="background: #fff3cd;">
                            <td>${a.product_name}</td>
                            <td>${a.quantity_available}</td>
                            <td>${a.reorder_level}</td>
                            <td><span class="badge badge-pending"> Reorder Required</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('alertsList').innerHTML = html;
    } catch (error) {
        showError('alertsList', error.message);
    }
}

async function loadAnalytics() {
    try {
        const analytics = await apiRequest('/analytics/dashboard');

        document.getElementById('totalRevenue').textContent = formatCurrency(analytics.total_revenue);
        document.getElementById('totalExpense').textContent = formatCurrency(analytics.total_expense);
        document.getElementById('profit').textContent = formatCurrency(analytics.profit);
        document.getElementById('avgRating').textContent = parseFloat(analytics.avg_rating).toFixed(1);
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

loadShipments();