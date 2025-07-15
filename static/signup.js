export function initializeSignup() {
    const getStartedButtons = document.querySelectorAll('.cta-button, .secondary-button');
    
    getStartedButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const buttonText = this.textContent.trim();
            
            if (buttonText === 'Get Started' || buttonText === 'Start Free Trial') {
                showSignupModal();
            } else if (buttonText === 'View Documentation') {
                document.querySelector('#documentation').scrollIntoView({ behavior: 'smooth' });
            } else if (buttonText === 'Contact Sales') {
                document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function showSignupModal() {
    const modal = document.createElement('div');
    modal.className = 'signup-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Get Started with BigAPI</h2>
            <form id="signup-form">
                <div class="form-group">
                    <input type="text" id="signup-name" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" id="signup-email" placeholder="Email Address" required>
                </div>
                <div class="form-group">
                    <input type="password" id="signup-password" placeholder="Create Password" required>
                </div>
                <div class="form-group">
                    <select id="signup-plan" required>
                        <option value="">Select Plan</option>
                        <option value="starter">Starter (Free)</option>
                        <option value="pro">Pro (0€/month)</option>
                        <option value="enterprise">Enterprise (0€)</option>
                    </select>
                </div>
                <button type="submit" class="cta-button">Create Account</button>
            </form>
            <p class="auth-link">Already have an account? <a href="#" id="switch-to-login">Log in</a></p>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    modal.querySelector('.close-modal').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => e.target === modal && closeModal(modal));
    
    const signupForm = modal.querySelector('#signup-form');
    signupForm.addEventListener('submit', handleSignupSubmit);
    
    modal.querySelector('#switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(modal);
        showLoginModal();
    });
}

function handleSignupSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('signup-name').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
        plan: document.getElementById('signup-plan').value
    };
    
    console.log('Signup form submitted:', formData);
    alert('Account created successfully! Redirecting to dashboard...');
    
    closeModal(document.querySelector('.signup-modal'));
}

function closeModal(modal) {
    if (modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    }
}