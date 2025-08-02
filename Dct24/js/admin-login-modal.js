// Custom Admin Login Modal
class AdminLoginModal {
    constructor() {
        this.modalContainer = null;
        this.createModal();
    }

    createModal() {
        // Create modal if doesn't exist
        if (!document.getElementById('adminLoginModal')) {
            const modal = document.createElement('div');
            modal.id = 'adminLoginModal';
            modal.innerHTML = `
                <div class="admin-modal-overlay" id="adminModalOverlay">
                    <div class="admin-modal">
                        <div class="admin-modal-header">
                            <h2><i class="fas fa-user-shield"></i> Admin Login</h2>
                            <button class="admin-modal-close" id="adminModalClose">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="admin-modal-body">
                            <form id="adminLoginForm" class="admin-login-form">
                                <div class="form-group">
                                    <label for="adminEmail">
                                        <i class="fas fa-envelope"></i> Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        id="adminEmail" 
                                        name="email"
                                        value=""
                                        placeholder="Enter admin email"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="adminPassword">
                                        <i class="fas fa-lock"></i> Password
                                    </label>
                                    <div class="password-input-container">
                                        <input 
                                            type="password" 
                                            id="adminPassword" 
                                            name="password"
                                            value=""
                                            placeholder="Enter admin password"
                                            required
                                        >
                                        <button type="button" class="password-toggle" id="passwordToggle">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-buttons">
                                    <button type="button" class="btn btn-cancel" id="adminLoginCancel">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                    <button type="submit" class="btn btn-admin-login" id="adminLoginSubmit">
                                        <i class="fas fa-sign-in-alt"></i> Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.addStyles();
            this.setupEventListeners();
        }
    }

    addStyles() {
        if (!document.getElementById('adminLoginStyles')) {
            const style = document.createElement('style');
            style.id = 'adminLoginStyles';
            style.textContent = `
                .admin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                }

                .admin-modal-overlay.show {
                    opacity: 1;
                    visibility: visible;
                }

                .admin-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    max-width: 450px;
                    width: 90%;
                    max-height: 90vh;
                    overflow: hidden;
                    transform: scale(0.7) translateY(-50px);
                    transition: all 0.3s ease;
                }

                .admin-modal-overlay.show .admin-modal {
                    transform: scale(1) translateY(0);
                }

                .admin-modal-header {
                    background: linear-gradient(135deg, #2c3e50, #34495e);
                    color: white;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 13px 13px 0 0;
                }

                .admin-modal-header h2 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .admin-modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .admin-modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: scale(1.1);
                }

                .admin-modal-body {
                    padding: 2rem;
                }

                .admin-login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-weight: 600;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                }

                .form-group input {
                    padding: 1rem;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #f8f9fa;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .password-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-toggle {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0.5rem;
                    transition: color 0.2s ease;
                }

                .password-toggle:hover {
                    color: #2c3e50;
                }

                .form-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .btn {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-cancel {
                    background: linear-gradient(135deg, #6c757d, #868e96);
                    color: white;
                    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
                }

                .btn-cancel:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
                }

                .btn-admin-login {
                    background: linear-gradient(135deg, #2c3e50, #34495e);
                    color: white;
                    box-shadow: 0 4px 15px rgba(44, 62, 80, 0.3);
                }

                .btn-admin-login:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(44, 62, 80, 0.4);
                }

                .form-error {
                    color: #dc3545;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .form-success {
                    color: #28a745;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                @media (max-width: 600px) {
                    .admin-modal {
                        width: 95%;
                        margin: 1rem;
                    }

                    .admin-modal-body {
                        padding: 1.5rem;
                    }

                    .form-buttons {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupEventListeners() {
        const overlay = document.getElementById('adminModalOverlay');
        const closeBtn = document.getElementById('adminModalClose');
        const cancelBtn = document.getElementById('adminLoginCancel');
        const form = document.getElementById('adminLoginForm');
        const passwordToggle = document.getElementById('passwordToggle');

        // Close modal handlers
        [overlay, closeBtn, cancelBtn].forEach(element => {
            if (element) {
                element.addEventListener('click', (e) => {
                    if (e.target === overlay || e.target === closeBtn || e.target === cancelBtn) {
                        this.hideModal();
                    }
                });
            }
        });

        // Password toggle
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                const passwordInput = document.getElementById('adminPassword');
                const icon = passwordToggle.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    showModal() {
        const overlay = document.getElementById('adminModalOverlay');
        if (overlay) {
            overlay.classList.add('show');
            setTimeout(() => {
                const emailInput = document.getElementById('adminEmail');
                if (emailInput) emailInput.focus();
            }, 300);
        }
    }

    hideModal() {
        const overlay = document.getElementById('adminModalOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            this.clearMessages();
        }
    }

    showError(message) {
        this.clearMessages();
        const form = document.getElementById('adminLoginForm');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        form.appendChild(errorDiv);
    }

    showSuccess(message) {
        this.clearMessages();
        const form = document.getElementById('adminLoginForm');
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        form.appendChild(successDiv);
    }

    clearMessages() {
        const messages = document.querySelectorAll('.form-error, .form-success');
        messages.forEach(msg => msg.remove());
    }

    async handleLogin() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        this.clearMessages();

        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        const expectedEmail = 'digitalcomputer1808@gmail.com';
        const expectedPassword = 'Digital@2025';

        if (email.toLowerCase() !== expectedEmail.toLowerCase() || password !== expectedPassword) {
            this.showError('Invalid admin credentials. Please try again.');
            return;
        }

        try {
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminEmail', email);

            this.showSuccess('Authentication successful! Redirecting...');

            setTimeout(() => {
                this.hideModal();
                window.location.href = 'admin.html';
            }, 1500);

        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }
}

// Create global instance
const adminLoginModal = new AdminLoginModal();
window.adminLoginModal = adminLoginModal;
export default adminLoginModal; 