if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const user = getCurrentUser();
if (user.role !== 'manufacturer') {
    redirectToDashboard(user.role);
}

document.getElementById('userName').textContent = user.name;

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'materials') loadMaterials();
    else if (tabName === 'products') loadProducts();
    else if (tabName === 'inventory') loadInventoryForm();
    else if (tabName === 'warehouses') loadWarehouses();
    else if (tabName === 'analytics') loadAnalytics();
}

async function loadMaterials() {
    showLoading('materialsList');
    
    try {
        const materials = await apiRequest('/manufacturer/raw-materials');
        
        if (materials.length === 0) {
            document.getElementById('materialsList').innerHTML = '<p>No materials available.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(m => `
                        <tr>
                            <td>${m.material_name}<br><small>${m.description || ''}</small></td>
                            <td>${m.supplier_name}</td>
                            <td>${m.quantity_available}</td>
                            <td>${formatCurrency(m.unit_price)}</td>
                            <td>${parseFloat(m.avg_rating).toFixed(1)} ⭐ (${m.rating_count})</td>
                            <td>
                                <button class="btn btn-primary" onclick="openOrderModal('${m.material_id}', '${m.material_name}', ${m.unit_price}, '${m.supplier_id}')">Order</button>
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

function openOrderModal(materialId, materialName, unitPrice, supplierId) {
    document.getElementById('orderMaterialId').value = materialId;
    document.getElementById('orderMaterialName').value = materialName;
    document.getElementById('orderUnitPrice').value = unitPrice;
    document.getElementById('orderSupplierId').value = supplierId;
    document.getElementById('orderModal').classList.add('active');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('active');
}

async function placeOrder(event) {
    event.preventDefault();
    
    const supplier_id = document.getElementById('orderSupplierId').value;
    const material_id = document.getElementById('orderMaterialId').value;
    const quantity = document.getElementById('orderQuantity').value;
    const unit_price = document.getElementById('orderUnitPrice').value;
    const shipping_address = document.getElementById('orderAddress').value;
    
    try {
        await apiRequest('/manufacturer/orders', {
            method: 'POST',
            body: JSON.stringify({
                supplier_id,
                items: [{
                    material_id,
                    quantity: parseInt(quantity),
                    unit_price: parseFloat(unit_price)
                }],
                shipping_address
            })
        });
        
        alert('Order placed successfully!');
        closeModal();
        event.target.reset();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function createProduct(event) {
    event.preventDefault();
    
    const data = {
        product_name: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        size: document.getElementById('size').value,
        color: document.getElementById('color').value,
        cost_price: document.getElementById('costPrice').value,
        selling_price: document.getElementById('sellingPrice').value,
        production_stage: document.getElementById('productionStage').value
    };
    
    try {
        await apiRequest('/manufacturer/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        alert('Product created successfully!');
        event.target.reset();
        loadProducts();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadProducts() {
    showLoading('productsList');
    
    try {
        const products = await apiRequest('/manufacturer/products');
        
        if (products.length === 0) {
            document.getElementById('productsList').innerHTML = '<p>No products created yet.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Cost/Selling</th>
                        <th>Stage</th>
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
                            <td>${formatCurrency(p.cost_price)} / ${formatCurrency(p.selling_price)}</td>
                            <td><span class="badge badge-${p.production_stage}">${p.production_stage}</span></td>
                            <td>
                                <select onchange="updateProductStage('${p.product_id}', this.value)">
                                    <option value="">Update Stage</option>
                                    <option value="planning">Planning</option>
                                    <option value="production">Production</option>
                                    <option value="quality_check">Quality Check</option>
                                    <option value="completed">Completed</option>
                                </select>
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

async function updateProductStage(productId, stage) {
    if (!stage) return;
    
    try {
        await apiRequest(`/manufacturer/products/${productId}/stage`, {
            method: 'PUT',
            body: JSON.stringify({ production_stage: stage })
        });
        
        alert('Product stage updated!');
        loadProducts();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadInventoryForm() {
    try {
        const products = await apiRequest('/manufacturer/products');
        const completedProducts = products.filter(p => p.production_stage === 'completed');
        
        const select = document.getElementById('inventoryProduct');
        select.innerHTML = '<option value="">Select Product</option>' +
            completedProducts.map(p => 
                `<option value="${p.product_id}">${p.product_name} - ${formatCurrency(p.selling_price)}</option>`
            ).join('');
    } catch (error) {
        console.error('Load inventory form error:', error);
    }
}

async function addToInventory(event) {
    event.preventDefault();
    
    const data = {
        product_id: document.getElementById('inventoryProduct').value,
        quantity_available: document.getElementById('inventoryQuantity').value,
        cost_price: document.getElementById('inventoryCost').value,
        selling_price: document.getElementById('inventorySelling').value,
        reorder_level: 50
    };
    
    try {
        await apiRequest('/manufacturer/inventory', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        alert('Added to inventory successfully!');
        event.target.reset();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadWarehouses() {
    showLoading('warehousesList');
    
    try {
        const warehouses = await apiRequest('/manufacturer/warehouses');
        
        if (warehouses.length === 0) {
            document.getElementById('warehousesList').innerHTML = '<p>No warehouses available.</p>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Warehouse Name</th>
                        <th>Address</th>
                        <th>Contact</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${warehouses.map(w => `
                        <tr>
                            <td>${w.name}</td>
                            <td>${w.address || 'N/A'}</td>
                            <td>${w.contact_number || 'N/A'}</td>
                            <td>${parseFloat(w.avg_rating).toFixed(1)} ⭐ (${w.rating_count})</td>
                            <td>
                                <button class="btn btn-primary" onclick="openShipmentModal('${w.user_id}', '${w.address}')">Send Shipment</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('warehousesList').innerHTML = html;
        
        // Load products for shipment modal
        const products = await apiRequest('/manufacturer/products');
        const completedProducts = products.filter(p => p.production_stage === 'completed');
        
        const select = document.getElementById('shipmentProduct');
        select.innerHTML = '<option value="">Select Product</option>' +
            completedProducts.map(p => 
                `<option value="${p.product_id}">${p.product_name}</option>`
            ).join('');
    } catch (error) {
        showError('warehousesList', error.message);
    }
}

function openShipmentModal(warehouseId, address) {
    document.getElementById('shipmentWarehouseId').value = warehouseId;
    document.getElementById('shipmentAddress').value = address || '';
    document.getElementById('shipmentModal').classList.add('active');
}

function closeShipmentModal() {
    document.getElementById('shipmentModal').classList.remove('active');
}

async function createShipment(event) {
    event.preventDefault();
    
    const data = {
        warehouse_id: document.getElementById('shipmentWarehouseId').value,
        product_id: document.getElementById('shipmentProduct').value,
        quantity: document.getElementById('shipmentQuantity').value,
        expected_delivery_date: document.getElementById('shipmentDate').value,
        shipping_address: document.getElementById('shipmentAddress').value
    };
    
    try {
        await apiRequest('/manufacturer/shipments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        alert('Shipment created successfully!');
        closeShipmentModal();
        event.target.reset();
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

loadMaterials();