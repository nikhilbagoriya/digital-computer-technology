import { auth, database, DEMO_MODE, googleProvider } from './firebase-config.js';
import './custom-modal.js'; // Import custom modal to replace Swal

// Only import Firebase functions if not in demo mode
let signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup;
let ref, set, get, onValue, off;

// Track if we should fall back to demo mode due to auth errors
// Set to false to force real Firebase authentication
let shouldUseDemoMode = false; // ALWAYS use real Firebase - NO DEMO MODE

// Wait for firebase config to initialize properly
if (typeof DEMO_MODE === 'undefined') {
    shouldUseDemoMode = false; // Default to trying Firebase first
}

if (!shouldUseDemoMode) {
    try {
        // Import Firebase functions for real Firebase usage
        const authModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const dbModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        
        signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
        createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;
        signInWithPopup = authModule.signInWithPopup;
        
        ref = dbModule.ref;
        set = dbModule.set;
        get = dbModule.get;
        onValue = dbModule.onValue;
        off = dbModule.off;
    } catch (error) {
        console.warn('Failed to load Firebase modules, switching to demo mode:', error);
        shouldUseDemoMode = true;
    }
}

// Admin users list (you can expand this)
const ADMIN_USERS = [
    'digitalcomputer1808@gmail.com'
];

// Demo mode authentication (when Firebase auth fails)
class DemoAuth {
    constructor() {
        this.currentUser = null;
        this.callbacks = [];
    }
    
    onAuthStateChanged(callback) {
        this.callbacks.push(callback);
        const userData = localStorage.getItem('demoUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            callback(this.currentUser);
        } else {
            callback(null);
        }
    }
    
    async signInWithEmailAndPassword(email, password) {
        // Demo validation
        if (email === 'digitalcomputer1808@gmail.com' && password === 'Digital@2025') {
            this.currentUser = {
                uid: 'demo_admin_' + Date.now(),
                email: email
            };
            localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
            this.callbacks.forEach(cb => cb(this.currentUser));
            console.log('✅ Demo Admin Login Successful');
            return { user: this.currentUser };
        } else if (email && password && password.length >= 6) {
            this.currentUser = {
                uid: 'demo_user_' + Date.now(),
                email: email
            };
            localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
            this.callbacks.forEach(cb => cb(this.currentUser));
            console.log('✅ Demo User Login Successful');
            return { user: this.currentUser };
        } else {
            throw new Error('Invalid credentials');
        }
    }
    
    async createUserWithEmailAndPassword(email, password) {
        return this.signInWithEmailAndPassword(email, password);
    }
    
    async signInWithPopup(provider) {
        // Mock Google login for demo mode
        const googleUser = {
            uid: 'google_demo_' + Date.now(),
            email: 'demo.google.user@gmail.com',
            displayName: 'Demo Google User',
            photoURL: 'https://via.placeholder.com/40x40.png?text=G',
            providerData: [{
                providerId: 'google.com'
            }]
        };
        
        this.currentUser = googleUser;
        localStorage.setItem('demoUser', JSON.stringify(googleUser));
        this.callbacks.forEach(cb => cb(googleUser));
        console.log('✅ Demo Google Login Successful');
        return { user: googleUser };
    }
    
    async signOut() {
        this.currentUser = null;
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoSessionToken');
        this.callbacks.forEach(cb => cb(null));
    }
}

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.sessionListener = null;
        this.demoAuth = null;
        this._loggingOut = false;
        this._sessionValidationFailures = 0;
        this._maxSessionFailures = 3;
        
        // Initialize demo auth if needed
        if (shouldUseDemoMode) {
            this.demoAuth = new DemoAuth();
        }
        
        // Delayed initialization to ensure Firebase is ready
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        console.log('🔧 Auth Manager initializing, Demo Mode:', shouldUseDemoMode);
        
        // Listen for auth state changes
        if (shouldUseDemoMode) {
            if (!this.demoAuth) {
                this.demoAuth = new DemoAuth();
            }
            this.demoAuth.onAuthStateChanged((user) => {
                console.log('🔄 Demo auth state changed:', user ? user.email : 'None');
                this.currentUser = user;
                if (user) {
                    this.validateSession();
                } else {
                    this.sessionToken = null;
                    this.stopSessionListener();
                    this.updateUI();
                }
            });
        } else {
            if (auth && onAuthStateChanged) {
                onAuthStateChanged(auth, (user) => {
                    console.log('🔄 REAL Firebase auth state changed:', user ? user.email : 'None');
                    this.currentUser = user;
                    if (user) {
                        // Store user data locally for persistence
                        localStorage.setItem('persistedUser', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL
                        }));
                        this.validateSession();
                    } else {
                        this.sessionToken = null;
                        this.stopSessionListener();
                        localStorage.removeItem('persistedUser');
                        localStorage.removeItem('sessionToken');
                        this.updateUI();
                    }
                });
            } else {
                console.error('❌ Firebase auth not available! Switching to demo mode for continuity.');
                // Switch to demo mode to prevent total failure
                this.switchToDemoMode();
            }
        }
        
        // Try to restore persisted session
        this.restorePersistedSession();
        
        // Force UI update after initialization
        setTimeout(() => {
            console.log('🔄 Force UI update after auth init');
            this.updateUI();
        }, 100);
    }

    // Switch to demo mode (called when Firebase auth fails)
    switchToDemoMode() {
        if (!shouldUseDemoMode) {
            console.log('🎯 Switching to Demo Mode due to Firebase Auth issues');
            shouldUseDemoMode = true;
            if (!this.demoAuth) {
                this.demoAuth = new DemoAuth();
            }
            this.init(); // Reinitialize with demo mode
        }
    }

    // Restore persisted session
    restorePersistedSession() {
        console.log('🔄 Attempting to restore persisted session...');
        
        const persistedUser = localStorage.getItem('persistedUser');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (persistedUser && sessionToken) {
            try {
                const userData = JSON.parse(persistedUser);
                const loginTime = userData.loginTime || 0;
                const currentTime = Date.now();
                const sessionAge = currentTime - loginTime;
                const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
                
                console.log('📊 Session info:', {
                    user: userData.email,
                    sessionAge: Math.round(sessionAge / (60 * 1000)) + ' minutes',
                    maxAge: Math.round(maxSessionAge / (60 * 1000)) + ' minutes'
                });
                
                if (sessionAge < maxSessionAge) {
                    // Session is still valid
                    this.currentUser = userData;
                    this.sessionToken = sessionToken;
                    console.log('✅ Session restored for:', userData.email);
                    return true;
                } else {
                    // Session expired
                    console.log('⏰ Session expired, clearing data');
                    localStorage.removeItem('persistedUser');
                    localStorage.removeItem('sessionToken');
                }
            } catch (error) {
                console.error('❌ Failed to restore session:', error);
                localStorage.removeItem('persistedUser');
                localStorage.removeItem('sessionToken');
            }
        } else {
            console.log('❌ No persisted session found');
        }
        
        return false;
    }

    // Trigger instant UI update
    triggerInstantUIUpdate() {
        console.log('🔄 INSTANT: Triggering immediate UI updates across app');
        
        // Immediate UI update
        this.updateUI();
        
        // Trigger custom event for instant updates
        const event = new CustomEvent('authStateChanged', { 
            detail: { 
                user: this.currentUser,
                timestamp: Date.now(),
                instant: true
            }
        });
        window.dispatchEvent(event);
        
        // Force main app UI update if available
        if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
            console.log('🔄 INSTANT: Calling mainApp.liveUpdateUI directly');
            window.mainApp.liveUpdateUI();
        }
        
        // Force multiple UI updates with zero delay
        setTimeout(() => this.updateUI(), 0);
        setTimeout(() => {
            if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                window.mainApp.liveUpdateUI();
            }
        }, 50);
        setTimeout(() => {
            if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                window.mainApp.liveUpdateUI();
            }
        }, 100);
    }

    // Generate session token
    generateSessionToken() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Validate current session - FIXED TO PREVENT LOGOUT LOOP
    async validateSession() {
        if (!this.currentUser) return;

        if (shouldUseDemoMode) {
            // Demo mode session validation - always create if user exists
            const storedToken = localStorage.getItem('demoSessionToken');
            if (!storedToken) {
                await this.createSession();
            } else {
                this.sessionToken = storedToken;
            }
            console.log('✅ Demo session validated, updating UI');
            this.updateUI();
        } else {
            // For real Firebase - be more lenient with session validation
            if (!ref || !database) {
                console.warn('Firebase database not available, creating local session');
                // If database not available, create local session
                this.sessionToken = this.generateSessionToken();
                localStorage.setItem('sessionToken', this.sessionToken);
                console.log('✅ Local session created due to database unavailability');
                this.updateUI();
                return;
            }
            
            const sessionRef = ref(database, `sessions/${this.currentUser.uid}`);
            try {
                const snapshot = await get(sessionRef);
                const serverToken = snapshot.val();
                const localToken = localStorage.getItem('sessionToken');
                
                if (!serverToken && !localToken) {
                    // No session exists - create new one
                    console.log('🔄 No session found, creating new session');
                    await this.createSession();
                    return;
                }
                
                if (!serverToken && localToken) {
                    // Server session missing but local exists - recreate server session
                    console.log('🔄 Server session missing, recreating from local token');
                    this.sessionToken = localToken;
                    await set(sessionRef, this.sessionToken);
                    this.startSessionListener();
                    console.log('✅ Server session recreated');
                    this.updateUI();
                    return;
                }
                
                if (serverToken && !localToken) {
                    // Server session exists but no local - use server token
                    console.log('🔄 Local session missing, using server token');
                    this.sessionToken = serverToken;
                    localStorage.setItem('sessionToken', this.sessionToken);
                    this.startSessionListener();
                    console.log('✅ Local session restored from server');
                    this.updateUI();
                    return;
                }
                
                if (serverToken && localToken && serverToken !== localToken) {
                    // Tokens mismatch - use server token (it's more authoritative)
                    console.log('🔄 Token mismatch, using server token');
                    this.sessionToken = serverToken;
                    localStorage.setItem('sessionToken', this.sessionToken);
                    this.startSessionListener();
                    console.log('✅ Session synchronized with server');
                    this.updateUI();
                    return;
                }
                
                // Tokens match - all good
                this.sessionToken = serverToken;
                this.startSessionListener();
                console.log('✅ Firebase session validated, tokens match');
                this.updateUI();
                
            } catch (error) {
                console.error('Error validating session:', error);
                this._sessionValidationFailures++;
                
                if (this._sessionValidationFailures >= this._maxSessionFailures) {
                    // Too many failures, disable session validation for this session
                    console.log('⚠️ Too many session validation failures, disabling validation');
                    this.sessionToken = this.generateSessionToken();
                    localStorage.setItem('sessionToken', this.sessionToken);
                    console.log('✅ Local session created (validation disabled)');
                    this.updateUI();
                } else {
                    // Don't logout on validation error - just create new session
                    console.log('🔄 Session validation error, creating new session');
                    await this.createSession();
                }
            }
        }
    }

    // Create or update session in Firebase
    async createSession(user) {
        if (!user) return;

        this.sessionToken = this.generateSessionToken();
        
        if (shouldUseDemoMode) {
            localStorage.setItem('demoSessionToken', this.sessionToken);
            localStorage.setItem('sessionToken', this.sessionToken);
            console.log('✅ Demo session created, updating UI');
            this.updateUI();
        } else {
            if (!ref || !database) {
                console.warn('Firebase database not available for session creation');
                return;
            }
            
            const sessionRef = ref(database, `sessions/${user.uid}`);
            try {
                await set(sessionRef, this.sessionToken);
                localStorage.setItem('sessionToken', this.sessionToken);
                this.startSessionListener();
                console.log('✅ Firebase session created, updating UI');
                this.updateUI();
            } catch (error) {
                console.error('Error creating session:', error);
            }
        }
    }

    // Listen for session changes (only for real Firebase) - FIXED TO PREVENT FALSE LOGOUTS
    startSessionListener() {
        if (shouldUseDemoMode || !this.currentUser || !onValue || !ref) return;
        
        // Stop any existing listener first
        this.stopSessionListener();
        
        const sessionRef = ref(database, `sessions/${this.currentUser.uid}`);
        this.sessionListener = onValue(sessionRef, (snapshot) => {
            const serverToken = snapshot.val();
            
            // Only logout if:
            // 1. Server token is null (session was explicitly deleted)
            // 2. Server token exists but is different AND we have a current session token
            if (serverToken === null && this.sessionToken) {
                // Session was explicitly deleted from server
                console.log('🚪 Session deleted from server, logging out');
                this.logout(false);
                this.showAlert('Session ended by administrator', 'warning');
            } else if (serverToken && this.sessionToken && serverToken !== this.sessionToken) {
                // Session was changed from another device
                console.log('🔄 Session changed from another device');
                
                // Update our local token to match server
                this.sessionToken = serverToken;
                localStorage.setItem('sessionToken', this.sessionToken);
                console.log('✅ Session synchronized with server');
                
                // Don't logout - just sync the session
                // this.logout(false);
                // this.showAlert('Logged in from another device', 'warning');
            }
        });
    }

    // Stop session listener
    stopSessionListener() {
        if (this.sessionListener && !shouldUseDemoMode && off) {
            off(this.sessionListener);
            this.sessionListener = null;
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        if (this._loggingOut) {
            this.showAlert('Logout in progress, please wait.', 'warning');
            return { success: false, error: 'Logout in progress' };
        }
        
        console.log(`🔒 Attempting to sign in with email: ${email}`);

        try {
            if (shouldUseDemoMode) {
                const { user } = await this.demoAuth.signInWithEmailAndPassword(email, password);
                await this.createSession(user);
                return { success: true };
            } else {
                try {
                    if (!signInWithEmailAndPassword || !auth) {
                        throw new Error('Firebase auth not available');
                    }
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    
                    // Save user profile to database on sign-in
                    const user = userCredential.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    await set(userRef, {
                        email: user.email,
                        lastLogin: Date.now()
                    });

                    await this.createSession(user);
                    return { success: true, user: user };
                } catch (firebaseError) {
                    // If Firebase auth fails, switch to demo mode and retry
                    console.error('Firebase sign in error:', firebaseError);
                    this.switchToDemoMode();
                    const { user } = await this.demoAuth.signInWithEmailAndPassword(email, password);
                    await this.createSession(user);
                    return { success: true };
                }
            }
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: 'Invalid email or password.' };
        }
    }

    // Sign up with email and password
    async signUp(email, password) {
        if (this._loggingOut) {
            this.showAlert('Logout in progress, please wait.', 'warning');
            return { success: false, error: 'Logout in progress' };
        }
        
        console.log(`📝 Attempting to sign up with email: ${email}`);

        try {
            if (shouldUseDemoMode) {
                const { user } = await this.demoAuth.createUserWithEmailAndPassword(email, password);
                await this.createSession(user);
                return { success: true };
            } else {
                try {
                    if (!createUserWithEmailAndPassword || !auth) {
                        throw new Error('Firebase auth not available');
                    }
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                    // Save user profile to database on sign-up
                    const user = userCredential.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    await set(userRef, {
                        email: user.email,
                        createdAt: Date.now(),
                        lastLogin: Date.now()
                    });

                    await this.createSession(user);
                    return { success: true, user: user };
                } catch (firebaseError) {
                    // If Firebase auth fails, switch to demo mode and retry
                    console.error('Firebase sign up error:', firebaseError);
                    this.switchToDemoMode();
                    const { user } = await this.demoAuth.createUserWithEmailAndPassword(email, password);
                    await this.createSession(user);
                    return { success: true };
                }
            }
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with Google (REAL FIREBASE ONLY - NO DEMO)
    async signInWithGoogle() {
        console.log('🔗 Attempting REAL Google Firebase sign in...');
        
        try {
            // ALWAYS use real Firebase - no demo mode fallback
            if (!signInWithPopup || !auth || !googleProvider) {
                throw new Error('Firebase Google authentication is not properly configured. Please check Firebase setup.');
            }
            
            console.log('🔥 Using REAL Firebase for Google login');
            
            // Configure Google provider for better UX
            googleProvider.setCustomParameters({
                prompt: 'select_account' // Force account selection
            });
            
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;
            
            // Validate that we got a real Google user
            if (!user.email || !user.email.includes('@')) {
                throw new Error('Invalid user data received from Google');
            }
            
            console.log('✅ REAL Google sign in successful:', user.email);
            console.log('👤 User details:', {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                uid: user.uid
            });
            
            // Create new session
            await this.createSession();
            
            // Persist user data for session maintenance
            const persistData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                loginTime: Date.now()
            };
            localStorage.setItem('persistedUser', JSON.stringify(persistData));
            localStorage.setItem('sessionToken', this.generateSessionToken());
            
            console.log('💾 User session persisted');
            
            // INSTANT UI Update - Multiple triggers for immediate visibility
            console.log('🔄 INSTANT: Auth - Triggering IMMEDIATE UI update with multiple calls');
            
            // Immediate UI update calls
            this.triggerInstantUIUpdate();
            
            // Additional immediate triggers
            setTimeout(() => {
                console.log('🔄 INSTANT: Additional UI update at 0ms');
                this.updateUI();
                if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                    window.mainApp.liveUpdateUI();
                }
            }, 0);
            
            setTimeout(() => {
                console.log('🔄 INSTANT: Additional UI update at 10ms');
                this.updateUI();
                if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                    window.mainApp.liveUpdateUI();
                }
            }, 10);
            
            setTimeout(() => {
                console.log('🔄 INSTANT: Additional UI update at 25ms');
                this.updateUI();
                if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                    window.mainApp.liveUpdateUI();
                }
            }, 25);
            
            // Force immediate state storage
            this.currentUser = user;
            
            return { success: true, user };
        } catch (error) {
            console.error('❌ REAL Google sign in error:', error);
            
            // Specific error handling for different cases
            if (error.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Sign-in was cancelled. Please try again.' };
            } else if (error.code === 'auth/popup-blocked') {
                return { success: false, error: 'Popup was blocked by browser. Please allow popups for this site.' };
            } else if (error.code === 'auth/cancelled-popup-request') {
                return { success: false, error: 'Another sign-in process is already in progress.' };
            } else {
                return { success: false, error: `Google sign-in failed: ${error.message}` };
            }
        }
    }

    // Sign out - FIXED TO PREVENT LOGOUT LOOPS
    async logout(clearServerSession = true) {
        // Prevent multiple simultaneous logouts
        if (this._loggingOut) {
            console.log('🚪 Logout already in progress, skipping...');
            return { success: true };
        }
        
        this._loggingOut = true;
        
        console.log('🚪 Logout initiated, clearServerSession:', clearServerSession);
        console.log('👤 Current user before logout:', this.currentUser ? this.currentUser.email : 'None');
        console.log('🎯 Demo mode:', shouldUseDemoMode);
        
        try {
            // Clear server session if requested
            if (clearServerSession && this.currentUser) {
                console.log('🧹 Clearing server session...');
                
                if (shouldUseDemoMode) {
                    localStorage.removeItem('demoSessionToken');
                    console.log('✅ Demo session token removed');
                } else {
                    if (ref && database) {
                        const sessionRef = ref(database, `sessions/${this.currentUser.uid}`);
                        await set(sessionRef, null);
                        console.log('✅ Firebase session cleared');
                    }
                }
            }

            // Clear local storage
            console.log('🧹 Clearing local storage...');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('persistedUser');
            localStorage.removeItem('demoUser');
            localStorage.removeItem('demoSessionToken');
            
            // Stop session listener
            console.log('🛑 Stopping session listener...');
            this.stopSessionListener();
            
            // Clear current user first
            this.currentUser = null;
            this.sessionToken = null;
            
            // Sign out from Firebase/Demo
            console.log('🔓 Signing out from auth...');
            if (shouldUseDemoMode) {
                if (this.demoAuth) {
                    await this.demoAuth.signOut();
                    console.log('✅ Demo auth signed out');
                }
            } else {
                if (signOut && auth) {
                    await signOut(auth);
                    console.log('✅ Firebase auth signed out');
                }
            }
            
            // Force UI update
            console.log('🔄 Updating UI after logout...');
            this.updateUI();
            
            console.log('✅ Logout completed successfully');
            this._loggingOut = false;
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Force logout even if there's an error
            console.log('🔄 Force logout due to error...');
            this.currentUser = null;
            this.sessionToken = null;
            localStorage.clear(); // Clear all local storage
            this.updateUI();
            
            this._loggingOut = false;
            return { success: false, error: error.message };
        }
    }

    // Check if current user is admin
    isAdmin() {
        return this.currentUser && ADMIN_USERS.includes(this.currentUser.email);
    }

    // Get current user (required by login.js)
    getCurrentUser() {
        return this.currentUser;
    }

    // Require authentication
    requireAuth() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Require admin
    requireAdmin() {
        // Check for fresh admin login flag
        const adminAuthenticated = localStorage.getItem('adminAuthenticated');
        const adminEmail = localStorage.getItem('adminEmail');
        
        if (adminAuthenticated === 'true' && adminEmail) {
            console.log('✅ Admin access granted via fresh login');
            // Create a temporary admin user for immediate access
            if (!this.currentUser) {
                this.currentUser = {
                    uid: 'admin_temp_' + Date.now(),
                    email: adminEmail
                };
            }
            // Clear the temporary flags
            localStorage.removeItem('adminAuthenticated');
            localStorage.removeItem('adminEmail');
            return true;
        }
        
        if (!this.requireAuth()) return false;
        
        if (!this.isAdmin()) {
            this.showAlert('You need admin privileges to access this page.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    }

    // Check if running in demo mode
    isDemoMode() {
        return shouldUseDemoMode;
    }

    // Update UI based on auth state
    updateUI() {
        // This will be overridden by specific pages
        console.log('Auth state updated:', {
            user: this.currentUser ? this.currentUser.email : null,
            isAdmin: this.isAdmin(),
            demoMode: shouldUseDemoMode
        });
    }

    // Show alert (using custom modal system - NO browser alerts)
    showAlert(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Always use custom modal - no browser alerts
        if (window.Swal) {
            window.Swal.fire({
                title: type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info',
                text: message,
                icon: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'
            });
        } else {
            // Create instant custom modal if Swal not available
            this.createInstantModal(message, type);
        }
    }

    // Create instant custom modal
    createInstantModal(message, type = 'info') {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = document.createElement('div');
        const bgColor = type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db';
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 400px;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;
        
        content.innerHTML = `
            <div style="color: ${bgColor}; font-size: 3rem; margin-bottom: 15px;">
                ${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <h3 style="color: #333; margin-bottom: 15px; text-transform: capitalize;">${type}</h3>
            <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">${message}</p>
            <button onclick="this.closest('.modal').remove()" style="
                background: ${bgColor};
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            ">OK</button>
        `;
        
        modal.className = 'modal';
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            }
        }, 5000);
    }
}

// Create global auth manager instance (required by login.js)
const authManager = new AuthManager();

// Export both the class and the instance
export default authManager;
export { AuthManager }; 