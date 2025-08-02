import authManager from './auth.js';

class LoginApp {
    constructor() {
        this.isLoginMode = true;
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🔧 Login App initializing...');
        
        // Wait a bit for auth manager to initialize
        setTimeout(() => {
            this.setupEventListeners();
            this.checkAuthState();
        }, 300);
    }

    checkAuthState() {
        console.log('🔍 Checking auth state...');
        
        // Check if user is already logged in
        const currentUser = authManager.getCurrentUser();
        console.log('👤 Current user in login page:', currentUser);
        
        if (currentUser) {
            console.log('🔄 User already logged in, redirecting...');
            
            // Determine redirect URL
            const isAdmin = authManager.isAdmin();
            const targetUrl = isAdmin ? 'admin.html' : 'index.html';
            
            // Simple redirect without showing extra messages
            console.log('🚀 Redirecting logged-in user to:', targetUrl);
            window.location.href = targetUrl;
        } else {
            console.log('👤 No user logged in, staying on login page');
        }
    }

    setupEventListeners() {
        // Toggle between login and signup
        const toggleLink = document.getElementById('toggleLink');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForm();
            });
        }

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Google login
        const googleLogin = document.getElementById('googleLogin');
        if (googleLogin) {
            googleLogin.addEventListener('click', () => {
                this.handleGoogleLogin();
            });
        }

        // Input validation
        this.setupInputValidation();
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearInputError(input));
        });
    }

    validateInput(input) {
        const formGroup = input.closest('.form-group');
        const value = input.value.trim();

        // Clear previous errors
        this.clearInputError(input);

        if (input.type === 'email') {
            if (!value) {
                this.showInputError(input, 'Email is required');
            } else if (!this.isValidEmail(value)) {
                this.showInputError(input, 'Please enter a valid email address');
            }
        } else if (input.type === 'password') {
            if (!value) {
                this.showInputError(input, 'Password is required');
            } else if (value.length < 6) {
                this.showInputError(input, 'Password must be at least 6 characters');
            }
        }
    }

    showInputError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearInputError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error', 'success');
        
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showInputSuccess(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    toggleForm() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const toggleText = document.getElementById('toggleText');
        const toggleLink = document.getElementById('toggleLink');

        if (this.isLoginMode) {
            // Switch to signup mode
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join our learning community';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleLink">Sign in</a>';
            this.isLoginMode = false;
        } else {
            // Switch to login mode
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to your account';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>';
            this.isLoginMode = true;
        }

        // Re-attach event listener to new toggle link
        const newToggleLink = document.getElementById('toggleLink');
        if (newToggleLink) {
            newToggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForm();
            });
        }

        // Clear any existing errors
        this.clearAllErrors();
    }

    clearAllErrors() {
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorDiv = group.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');

        console.log('🔐 Attempting login for:', email);

        // Validate inputs
        if (!this.validateLoginForm(email, password)) {
            console.log('❌ Form validation failed');
            return;
        }

        // Show loading state
        this.setLoadingState(submitBtn, true);

        try {
            console.log('📡 Calling authManager.signIn...');
            const result = await authManager.signIn(email, password);
            console.log('🔄 Login result:', result);
            
            if (result.success) {
                console.log('✅ Login successful!');
                console.log('👤 Current user:', authManager.getCurrentUser());
                console.log('🔑 Is admin:', authManager.isAdmin());
                console.log('🎯 Demo mode:', authManager.isDemoMode());
                
                // Determine redirect URL
                const isAdmin = authManager.isAdmin();
                const targetUrl = isAdmin ? 'admin.html' : 'index.html';
                
                console.log('🚀 Target URL:', targetUrl);
                
                // Show simple success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Welcome back to Dct24',
                    timer: 1500,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                
                // Wait a bit for auth state to update
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Automatic redirect
                console.log('🔗 Automatic redirect to:', targetUrl);
                window.location.href = targetUrl;
                
            } else {
                console.error('❌ Login failed:', result.error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: this.getErrorMessage(result.error)
                });
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async handleSignup() {
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');

        console.log('📝 Attempting signup for:', email);

        // Validate inputs
        if (!this.validateSignupForm(email, password, confirmPassword)) {
            console.log('❌ Signup form validation failed');
            return;
        }

        // Show loading state
        this.setLoadingState(submitBtn, true);

        try {
            console.log('📡 Calling authManager.signUp...');
            const result = await authManager.signUp(email, password);
            console.log('🔄 Signup result:', result);
            
            if (result.success) {
                console.log('✅ Signup successful!');
                
                // Show simple success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    text: 'Welcome to Dct24! Your account has been created successfully.',
                    timer: 1500,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                
                // Wait a bit for auth state to update
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Redirect to home page
                console.log('🚀 Redirecting to index.html');
                window.location.href = 'index.html';
            } else {
                console.error('❌ Signup failed:', result.error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: this.getErrorMessage(result.error)
                });
            }
        } catch (error) {
            console.error('❌ Signup error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Signup Failed',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async handleGoogleLogin() {
        console.log('🔗 Google login clicked');
        
        const googleBtn = document.getElementById('googleLogin');
        this.setLoadingState(googleBtn, true);
        
        try {
            console.log('🔄 Attempting Google sign in...');
            
            const result = await authManager.signInWithGoogle();
            
            if (result.success) {
                console.log('✅ Google sign in successful');
                
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Welcome!',
                    text: `Signed in with Google successfully! ${authManager.isDemoMode() ? '(Demo Mode)' : ''}`,
                    timer: 2000,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                
                // Wait a bit for auth state to update
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Determine redirect URL
                const isAdmin = authManager.isAdmin();
                const targetUrl = isAdmin ? 'admin.html' : 'index.html';
                
                console.log('🚀 Redirecting to:', targetUrl);
                window.location.href = targetUrl;
                
            } else {
                console.error('❌ Google sign in failed:', result.error);
                
                let errorMessage = 'Google sign in failed. Please try again.';
                
                // Handle specific error cases
                if (result.error.includes('popup-closed-by-user')) {
                    errorMessage = 'Sign in was cancelled. Please try again.';
                } else if (result.error.includes('popup-blocked')) {
                    errorMessage = 'Popup was blocked. Please allow popups and try again.';
                } else if (result.error.includes('network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                }
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Google Sign In Failed',
                    text: errorMessage
                });
            }
        } catch (error) {
            console.error('❌ Google login error:', error);
            
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred during Google sign in. Please try again.'
            });
        } finally {
            this.setLoadingState(googleBtn, false);
        }
    }

    validateLoginForm(email, password) {
        let isValid = true;

        // Validate email
        if (!email) {
            this.showInputError(document.getElementById('loginEmail'), 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showInputError(document.getElementById('loginEmail'), 'Please enter a valid email address');
            isValid = false;
        } else {
            this.showInputSuccess(document.getElementById('loginEmail'));
        }

        // Validate password
        if (!password) {
            this.showInputError(document.getElementById('loginPassword'), 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showInputError(document.getElementById('loginPassword'), 'Password must be at least 6 characters');
            isValid = false;
        } else {
            this.showInputSuccess(document.getElementById('loginPassword'));
        }

        return isValid;
    }

    validateSignupForm(email, password, confirmPassword) {
        let isValid = true;

        // Validate email
        if (!email) {
            this.showInputError(document.getElementById('signupEmail'), 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showInputError(document.getElementById('signupEmail'), 'Please enter a valid email address');
            isValid = false;
        } else {
            this.showInputSuccess(document.getElementById('signupEmail'));
        }

        // Validate password
        if (!password) {
            this.showInputError(document.getElementById('signupPassword'), 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showInputError(document.getElementById('signupPassword'), 'Password must be at least 6 characters');
            isValid = false;
        } else {
            this.showInputSuccess(document.getElementById('signupPassword'));
        }

        // Validate confirm password
        if (!confirmPassword) {
            this.showInputError(document.getElementById('confirmPassword'), 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showInputError(document.getElementById('confirmPassword'), 'Passwords do not match');
            isValid = false;
        } else {
            this.showInputSuccess(document.getElementById('confirmPassword'));
        }

        return isValid;
    }

    setLoadingState(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const loadingIcon = button.querySelector('.loading-icon');

        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (loadingIcon) loadingIcon.style.display = 'inline-block';
            if (btnText) btnText.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (loadingIcon) loadingIcon.style.display = 'none';
            if (btnText) btnText.style.opacity = '1';
        }
    }

    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
            'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your internet connection.',
            'auth/invalid-credential': 'Invalid email or password. Please check your credentials.'
        };

        return errorMessages[error] || 'An error occurred. Please try again.';
    }
}

// Initialize the login app
console.log('🎯 Starting Login App...');
const loginApp = new LoginApp(); 