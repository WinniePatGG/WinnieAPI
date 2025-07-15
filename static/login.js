let currentUser = null;

export function initializeLogin() {
    const savedUser = localStorage.getItem('bigapi_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

export function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Welcome Back</h2>
            <div id="login-error" class="error-message"></div>
            <form id="login-form">
                <div class="form-group">
                    <input type="email" id="login-email" placeholder="Email Address" required>
                </div>
                <div class="form-group">
                    <input type="password" id="login-password" placeholder="Password" required>
                </div>
                <div class="form-group remember-me">
                    <input type="checkbox" id="remember-me">
                    <label for="remember-me">Remember me</label>
                </div>
                <button type="submit" class="cta-button">Log In</button>
            </form>
            <p class="auth-link">Don't have an account? <a href="#" id="switch-to-signup">Sign up</a></p>
            <p class="forgot-password"><a href="#">Forgot password?</a></p>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    modal.querySelector('.close-modal').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => e.target === modal && closeModal(modal));
    
    const loginForm = modal.querySelector('#login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLoginSubmit();
    });
    
    modal.querySelector('#switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(modal);
        showSignupModal();
    });
}

async function handleLoginSubmit() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const errorElement = document.getElementById('login-error');

    errorElement.textContent = '';
    
    try {
        const user = await authenticateUser(email, password);
        
        currentUser = user;
        if (rememberMe) {
            localStorage.setItem('bigapi_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('bigapi_user', JSON.stringify(user));
        }
        
        updateAuthUI();
        closeModal(document.querySelector('.login-modal'));
        showToast('Login successful!');
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

async function authenticateUser(email, password) {
    await new Promise(resolve => setTimeout(resolve, 800));    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        throw new Error('User not found');
    }
    
    if (user.password !== password) {
        throw new Error('Incorrect password');
    }
    
    const { password: _, ...userData } = user;
    return userData;
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-dropdown">
                <button class="user-menu-btn">
                    <i class="fas fa-user-circle"></i>
                    ${currentUser.name}
                    <i class="fas fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    <a href="#"><i class="fas fa-user"></i> Profile</a>
                    <a href="#"><i class="fas fa-cog"></i> Settings</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        authButtons.innerHTML = `
            <button class="secondary-button login-btn">Log In</button>
            <button class="cta-button signup-btn">Sign Up</button>
        `;
        
        document.querySelector('.login-btn').addEventListener('click', showLoginModal);
        document.querySelector('.signup-btn').addEventListener('click', showSignupModal);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('bigapi_user');
    sessionStorage.removeItem('bigapi_user');
    updateAuthUI();
    showToast('Logged out successfully');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}