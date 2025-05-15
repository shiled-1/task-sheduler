// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const userJSON = localStorage.getItem('currentUser');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Initialize users if not exist
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            {
                id: '1',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: '2',
                name: 'Manager User',
                email: 'manager@example.com',
                password: 'manager123',
                role: 'manager'
            },
            {
                id: '3',
                name: 'Team Member 1',
                email: 'member1@example.com',
                password: 'member123',
                role: 'member'
            },
            {
                id: '4',
                name: 'Team Member 2',
                email: 'member2@example.com',
                password: 'member123',
                role: 'member'
            }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
}

// Get all users
function getUsers() {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

// Get managers
function getManagers() {
    return getUsers().filter(user => user.role === 'manager');
}

// Get team members
function getTeamMembers() {
    return getUsers().filter(user => user.role === 'member');
}

// Get user by ID
function getUserById(userId) {
    const users = getUsers();
    return users.find(user => user.id === userId);
}

// Login handler
function handleLogin(email, password) {
    const users = getUsers();
    const user = users.find(user => user.email === email && user.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    
    return null;
}

// Signup handler
function handleSignup(name, email, password, role) {
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role
    };
    
    // Add user to storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Redirect to appropriate dashboard based on role
function redirectToDashboard(user) {
    if (!user) return;
    
    switch(user.role) {
        case 'admin':
            window.location.href = 'dashboard-admin.html';
            break;
        case 'manager':
            window.location.href = 'dashboard-manager.html';
            break;
        case 'member':
            window.location.href = 'dashboard-member.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// Check auth status on page load
function checkAuthStatus() {
    // Initialize users
    initializeUsers();
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Handle login/signup pages
    if (currentPage === 'index.html' || currentPage === 'signup.html' || currentPage === '') {
        if (isLoggedIn()) {
            redirectToDashboard(getCurrentUser());
        }
        return;
    }
    
    // Handle dashboard and other protected pages
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is accessing the correct dashboard
    const user = getCurrentUser();
    if (user) {
        const requiredRole = (() => {
            if (currentPage === 'dashboard-admin.html') return 'admin';
            if (currentPage === 'dashboard-manager.html') return 'manager';
            if (currentPage === 'dashboard-member.html') return 'member';
            return null;
        })();
        
        if (requiredRole && user.role !== requiredRole) {
            redirectToDashboard(user);
        }
    }
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const user = handleLogin(email, password);
            
            if (user) {
                redirectToDashboard(user);
            } else {
                loginError.textContent = 'Invalid email or password';
            }
        });
    }
}

// Setup signup form
function setupSignupForm() {
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');
    
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const result = handleSignup(name, email, password, role);
            
            if (result.success) {
                redirectToDashboard(result.user);
            } else {
                signupError.textContent = result.message;
            }
        });
    }
}

// Setup logout button
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Setup chat icon navigation
function setupChatNavigation() {
    const chatIcon = document.getElementById('chat-icon');
    
    if (chatIcon) {
        chatIcon.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'chatbox.html';
        });
    }
    
    const backToDashboard = document.getElementById('back-to-dashboard');
    
    if (backToDashboard) {
        backToDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            redirectToDashboard(getCurrentUser());
        });
    }
}

// Display current user in dashboard header
function displayCurrentUser() {
    const user = getCurrentUser();
    
    if (!user) return;
    
    // Set user name in header based on role
    const adminName = document.getElementById('admin-name');
    const managerName = document.getElementById('manager-name');
    const memberName = document.getElementById('member-name');
    
    if (adminName && user.role === 'admin') {
        adminName.textContent = user.name;
    }
    
    if (managerName && user.role === 'manager') {
        managerName.textContent = user.name;
    }
    
    if (memberName && user.role === 'member') {
        memberName.textContent = user.name;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check auth status
    checkAuthStatus();
    
    // Setup forms
    setupLoginForm();
    setupSignupForm();
    setupLogout();
    setupChatNavigation();
    
    // Display user name in header
    displayCurrentUser();
});