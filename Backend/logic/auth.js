function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.querySelector('.auth-buttons').style.display = 'none';
}

function showSignup() {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.querySelector('.auth-buttons').style.display = 'none';
}

function hideAuth() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.querySelector('.auth-buttons').style.display = 'flex';
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        setAuthData(data.token, data.user);
        redirectToDashboard(data.user.role);
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    const contact_number = document.getElementById('signupContact').value;
    const address = document.getElementById('signupAddress').value;
    const errorDiv = document.getElementById('signupError');
    
    try {
        await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ 
                name, email, password, role, contact_number, address 
            })
        });
        
        alert('Account created successfully! Please login.');
        showLogin();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function logout() {
    clearAuthData();
    window.location.href = 'index.html';
}

// Check if already logged in
if (isAuthenticated() && window.location.pathname.endsWith('index.html')) {
    const user = getCurrentUser();
    redirectToDashboard(user.role);
}