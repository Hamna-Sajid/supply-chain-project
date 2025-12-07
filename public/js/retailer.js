if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const user = getCurrentUser();
if (user.role !== 'retailer') {
    redirectToDashboard(user.role);
}

document.getElementById('userName').textContent = user.name;

let currentRating = 0;
let allOrders = [];
let saleItemCount = 1;
let retailerInventory = [];

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'products') loadProducts();
    else if (tabName === 'sales') {
        loadSalesTab();
    }
    else if (tabName === 'orders') loadOrders();
    else if (tabName === 'returns') {
        loadReturnsForm();
        loadReturns();
    }
    else if (tabName === 'inventory') loadInventory();
    else if (tabName === 'expenses') loadExpenses();
    else if (tabName === 'analytics') loadAnalytics();
}

async function loadProducts() {
    showLoading('productsList');
    
    try {
        const products = await apiRequest('/retailer/products');
        
        if (products.length === 0) {
            document.getElementById('productsList').innerHTML = '<p>No products available.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Warehouse</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.product_name}<br>
                                <small>${p.size || ''} ${p.color || ''}</small>
                            </td>
                            <td>${p.category || 'N/A'}</td>
                            <td>${p.warehouse_name}<br>
                                <small>${p.warehouse_address || ''}</small>
                            </td>
                            <td>${p.quantity_available}</td>
                            <td>${formatCurrency(p.selling_price)}</td>
                            <td>${parseFloat(p.warehouse_rating).toFixed(1)} ⭐ (${p.rating_count})</td>
                            <td>
                                <button class="btn btn-primary" onclick="openOrderModal('${p.product_id}', '${p.product_name}', '${p.warehouse_id}', '${p.warehouse_name}', ${p.selling_price})">Order</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('productsList').innerHTML = html;
    } catch (error) {
        showError('productsList', error.message);
    }
}

function openOrderModal(productId, productName, warehouseId, warehouseName, price) {
    document.getElementById('orderProductId').value = productId;
    document.getElementById('orderProductName').value = productName;
    document.getElementById('orderWarehouseId').value = warehouseId;
    document.getElementById('orderWarehouseName').value = warehouseName;
    document.getElementById('orderUnitPrice').value = price;
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

async function placeOrder(event) {
    event.preventDefault();
    
    const warehouse_id = document.getElementById('orderWarehouseId').value;
    const product_id = document.getElementById('orderProductId').value;
    const quantity = document.getElementById('orderQuantity').value;
    const unit_price = document.getElementById('orderUnitPrice').value;
    const shipping_address = document.getElementById('orderAddress').value;
    
    try {
        await apiRequest('/retailer/orders', {
            method: 'POST',
            body: JSON.stringify({
                warehouse_id,
                items: [{
                    product_id,
                    quantity: parseInt(quantity),
                    unit_price: parseFloat(unit_price)
                }],
                shipping_address
            })
        });
        
        alert('Order placed successfully!');
        closeOrderModal();
        event.target.reset();
        loadOrders();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadOrders() {
    showLoading('ordersList');
    
    try {
        allOrders = await apiRequest('/retailer/orders');
        
        if (allOrders.length === 0) {
            document.getElementById('ordersList').innerHTML = '<p>No orders yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Warehouse</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allOrders.map(o => `
                        <tr>
                            <td>${o.order_id.substring(0, 8)}...</td>
                            <td>${o.warehouse_name}</td>
                            <td>${formatDate(o.order_date)}</td>
                            <td>${formatCurrency(o.total_amount)}</td>
                            <td><span class="badge badge-${o.order_status}">${o.order_status}</span></td>
                            <td>
                                ${o.order_status === 'delivered' ? 
                                    `<button class="btn btn-success" onclick="openRatingModal('${o.order_id}', '${o.delivered_by}')">Rate</button>` : 
                                    'N/A'}
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

function openRatingModal(orderId, userId) {
    document.getElementById('ratingOrderId').value = orderId;
    document.getElementById('ratingUserId').value = userId;
    document.getElementById('ratingModal').classList.add('active');
    setRating(0);
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
}

function setRating(rating) {
    currentRating = rating;
    document.getElementById('ratingValue').value = rating;
    
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

async function submitRating(event) {
    event.preventDefault();
    
    const order_id = document.getElementById('ratingOrderId').value;
    const rated_user_id = document.getElementById('ratingUserId').value;
    const rating_value = document.getElementById('ratingValue').value;
    const review_text = document.getElementById('ratingReview').value;
    
    if (!rating_value) {
        alert('Please select a rating');
        return;
    }
    
    try {
        await apiRequest('/ratings', {
            method: 'POST',
            body: JSON.stringify({
                order_id,
                rated_user_id,
                rating_value: parseInt(rating_value),
                review_text
            })
        });
        
        alert('Rating submitted successfully!');
        closeRatingModal();
        event.target.reset();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadReturnsForm() {
    try {
        const orders = await apiRequest('/retailer/orders');
        const deliveredOrders = orders.filter(o => o.order_status === 'delivered');
        
        const select = document.getElementById('returnOrder');
        select.innerHTML = '<option value="">Select Order</option>' +
            deliveredOrders.map(o => 
                `<option value="${o.order_id}">Order ${o.order_id.substring(0, 8)}... - ${formatDate(o.order_date)}</option>`
            ).join('');
    } catch (error) {
        console.error('Load returns form error:', error);
    }
}

async function loadOrderProducts() {
    const orderId = document.getElementById('returnOrder').value;
    if (!orderId) return;
    
    try {
        const items = await apiRequest(`/retailer/orders/${orderId}`);
        
        const select = document.getElementById('returnProduct');
        select.innerHTML = '<option value="">Select Product</option>' +
            items.map(i => 
                `<option value="${i.product_id}">${i.product_name} (Qty: ${i.quantity})</option>`
            ).join('');
    } catch (error) {
        console.error('Load order products error:', error);
    }
}

async function createReturn(event) {
    event.preventDefault();
    
    const order_id = document.getElementById('returnOrder').value;
    const product_id = document.getElementById('returnProduct').value;
    const quantity = document.getElementById('returnQuantity').value;
    const reason = document.getElementById('returnReason').value;
    
    try {
        await apiRequest('/retailer/returns', {
            method: 'POST',
            body: JSON.stringify({
                order_id,
                product_id,
                quantity: parseInt(quantity),
                reason
            })
        });
        
        alert('Return created successfully!');
        event.target.reset();
        loadReturns();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadReturns() {
    showLoading('returnsList');
    
    try {
        const returns = await apiRequest('/retailer/returns');
        
        if (returns.length === 0) {
            document.getElementById('returnsList').innerHTML = '<p>No returns yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Return ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${returns.map(r => `
                        <tr>
                            <td>${r.return_id.substring(0, 8)}...</td>
                            <td>${r.product_name}</td>
                            <td>${r.quantity}</td>
                            <td>${r.reason}</td>
                            <td><span class="badge badge-${r.status}">${r.status}</span></td>
                            <td>${formatDate(r.return_date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('returnsList').innerHTML = html;
    } catch (error) {
        showError('returnsList', error.message);
    }
}

async function loadInventory() {
    showLoading('inventoryList');
    
    try {
        const inventory = await apiRequest('/retailer/inventory');
        retailerInventory = inventory;
        
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
                    </tr>
                </thead>
                <tbody>
                    ${inventory.map(i => `
                        <tr>
                            <td>${i.product_name}</td>
                            <td>${i.category || 'N/A'}</td>
                            <td>${i.quantity_available}</td>
                            <td>${formatCurrency(i.cost_price)}</td>
                            <td>${formatCurrency(i.selling_price)}</td>
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

// Sales functions
async function loadSalesTab() {
    await loadRetailerInventory();
    populateSaleProducts();
    loadSalesSummary();
    loadSalesHistory();
}

async function loadRetailerInventory() {
    try {
        retailerInventory = await apiRequest('/retailer/inventory');
    } catch (error) {
        console.error('Load inventory error:', error);
    }
}

function populateSaleProducts() {
    const selects = document.querySelectorAll('.sale-product');
    const options = '<option value="">Select Product</option>' +
        retailerInventory.map(i => 
            `<option value="${i.product_id}" data-price="${i.selling_price}" data-stock="${i.quantity_available}">
                ${i.product_name} - Stock: ${i.quantity_available} - ${formatCurrency(i.selling_price)}
            </option>`
        ).join('');
    
    selects.forEach(select => {
        select.innerHTML = options;
    });
}

function addSaleItem() {
    const container = document.getElementById('saleItemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'sale-item';
    newItem.id = `saleItem${saleItemCount}`;
    newItem.innerHTML = `
        <div class="grid-2">
            <div class="form-group">
                <label>Select Product:</label>
                <select class="sale-product" required onchange="updateSaleItemPrice(${saleItemCount})">
                    <option value="">Select Product</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" class="sale-quantity" min="1" required onchange="updateSaleTotal()">
            </div>
            <div class="form-group">
                <label>Price per Unit:</label>
                <input type="number" step="0.01" class="sale-price" required onchange="updateSaleTotal()">
            </div>
            <div class="form-group">
                <label>Subtotal:</label>
                <input type="text" class="sale-subtotal" readonly>
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeSaleItem(${saleItemCount})">Remove Item</button>
        <hr>
    `;
    
    container.appendChild(newItem);
    populateSaleProducts();
    saleItemCount++;
}

function removeSaleItem(itemId) {
    const item = document.getElementById(`saleItem${itemId}`);
    if (item) {
        item.remove();
        updateSaleTotal();
    }
}

function updateSaleItemPrice(itemId) {
    const container = document.getElementById(`saleItem${itemId}`);
    const select = container.querySelector('.sale-product');
    const priceInput = container.querySelector('.sale-price');
    
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption.value) {
        const price = selectedOption.getAttribute('data-price');
        priceInput.value = price;
        updateSaleTotal();
    }
}

function updateSaleTotal() {
    let total = 0;
    const items = document.querySelectorAll('.sale-item');
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.sale-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.sale-price').value) || 0;
        const subtotal = quantity * price;
        
        item.querySelector('.sale-subtotal').value = formatCurrency(subtotal);
        total += subtotal;
    });
    
    document.getElementById('saleTotalAmount').textContent = formatCurrency(total);
}

function clearSaleForm() {
    document.getElementById('saleItemsContainer').innerHTML = `
        <h3>Sale Items</h3>
        <div class="sale-item" id="saleItem0">
            <div class="grid-2">
                <div class="form-group">
                    <label>Select Product:</label>
                    <select class="sale-product" required onchange="updateSaleItemPrice(0)">
                        <option value="">Select Product</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity:</label>
                    <input type="number" class="sale-quantity" min="1" required onchange="updateSaleTotal()">
                </div>
                <div class="form-group">
                    <label>Price per Unit:</label>
                    <input type="number" step="0.01" class="sale-price" required onchange="updateSaleTotal()">
                </div>
                <div class="form-group">
                    <label>Subtotal:</label>
                    <input type="text" class="sale-subtotal" readonly>
                </div>
            </div>
        </div>
    `;
    document.getElementById('saleNote').value = '';
    document.getElementById('saleTotalAmount').textContent = '$0.00';
    saleItemCount = 1;
    populateSaleProducts();
}

async function recordSale(event) {
    event.preventDefault();
    
    const items = [];
    const saleItems = document.querySelectorAll('.sale-item');
    
    saleItems.forEach(item => {
        const productSelect = item.querySelector('.sale-product');
        const quantity = parseInt(item.querySelector('.sale-quantity').value);
        const price = parseFloat(item.querySelector('.sale-price').value);
        
        if (productSelect.value) {
            const stock = parseInt(productSelect.options[productSelect.selectedIndex].getAttribute('data-stock'));
            
            if (quantity > stock) {
                throw new Error(`Insufficient stock for ${productSelect.options[productSelect.selectedIndex].text}`);
            }
            
            items.push({
                product_id: productSelect.value,
                quantity: quantity,
                price_per_unit: price
            });
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const sale_note = document.getElementById('saleNote').value;
    
    try {
        await apiRequest('/retailer/sales', {
            method: 'POST',
            body: JSON.stringify({ items, sale_note })
        });
        
        alert('Sale recorded successfully!');
        clearSaleForm();
        loadSalesTab();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadSalesSummary() {
    try {
        const today = await apiRequest('/retailer/sales-summary?period=day');
        const week = await apiRequest('/retailer/sales-summary?period=week');
        const month = await apiRequest('/retailer/sales-summary?period=month');
        
        document.getElementById('todaySales').textContent = formatCurrency(today.total_revenue);
        document.getElementById('weekSales').textContent = formatCurrency(week.total_revenue);
        document.getElementById('monthSales').textContent = formatCurrency(month.total_revenue);
        document.getElementById('totalProfit').textContent = formatCurrency(month.total_profit);
    } catch (error) {
        console.error('Load sales summary error:', error);
    }
}

async function loadSalesHistory() {
    showLoading('salesHistoryList');
    
    try {
        const startDate = document.getElementById('salesStartDate')?.value;
        const endDate = document.getElementById('salesEndDate')?.value;
        
        let url = '/retailer/sales';
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length > 0) url += '?' + params.join('&');
        
        const sales = await apiRequest(url);
        
        if (sales.length === 0) {
            document.getElementById('salesHistoryList').innerHTML = '<p>No sales recorded yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Sale ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(s => `
                        <tr>
                            <td>${s.sale_id.substring(0, 8)}...</td>
                            <td>${formatDate(s.sale_date)}</td>
                            <td>${s.item_count} items</td>
                            <td>${formatCurrency(s.total_amount)}</td>
                            <td>${s.sale_note || 'N/A'}</td>
                            <td>
                                <button class="btn btn-primary" onclick="viewSaleDetails('${s.sale_id}')">View Details</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('salesHistoryList').innerHTML = html;
    } catch (error) {
        showError('salesHistoryList', error.message);
    }
}

function clearSalesFilter() {
    document.getElementById('salesStartDate').value = '';
    document.getElementById('salesEndDate').value = '';
    loadSalesHistory();
}

async function viewSaleDetails(saleId) {
    try {
        const items = await apiRequest(`/retailer/sales/${saleId}`);
        
        const details = items.map(item => `
            - ${item.product_name} (${item.category || 'N/A'})<br>
              Quantity: ${item.quantity} × ${formatCurrency(item.price_per_unit)} = ${formatCurrency(item.subtotal)}
        `).join('<br>');
        
        alert('Sale Details:\n\n' + details.replace(/<br>/g, '\n'));
    } catch (error) {
        alert('Error: ' + error.message);
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

loadProducts();