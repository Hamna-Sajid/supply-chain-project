const API_URL = 'http://localhost:3000/api';

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set auth data
function setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Redirect based on role
function redirectToDashboard(role) {
    const dashboards = {
        'supplier': 'supplier.html',
        'manufacturer': 'manufacturer.html',
        'warehouse_manager': 'warehouse.html',
        'retailer': 'retailer.html'
    };
    window.location.href = dashboards[role] || 'index.html';
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        clearAuthData();
        window.location.href = 'index.html';
        return;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    
    return data;
}

// Show loading
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Show error
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}