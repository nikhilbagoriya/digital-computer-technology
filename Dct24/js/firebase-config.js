// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Original Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPYux3ebPXl8VYE8nE-NLU4jd3a7AGI6c",
  authDomain: "onlineexam-41f3f.firebaseapp.com",
  databaseURL: "https://onlineexam-41f3f-default-rtdb.firebaseio.com",
  projectId: "onlineexam-41f3f",
  storageBucket: "onlineexam-41f3f.firebasestorage.app",
  messagingSenderId: "1066952522138",
  appId: "1:1066952522138:web:c3afbe60e3c08d0f1ca223"
};

// Check if we should use demo mode (fallback if Firebase not configured)
// Set to false to enable real Firebase Google Authentication
const USE_DEMO_MODE = false; // ALWAYS use real Firebase - NO DEMO MODE

let auth, database, app;

if (USE_DEMO_MODE) {
    // Demo Mode Classes
    class MockAuth {
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
            if (email && password && password.length >= 6) {
                this.currentUser = {
                    uid: 'demo_' + Date.now(),
                    email: email
                };
                localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
                this.callbacks.forEach(cb => cb(this.currentUser));
                return { user: this.currentUser };
            } else {
                throw new Error('Invalid credentials');
            }
        }
        
        async createUserWithEmailAndPassword(email, password) {
            return this.signInWithEmailAndPassword(email, password);
        }
        
        async signInWithPopup(provider) {
            // Mock Google login
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
            return { user: googleUser };
        }

        async signOut() {
            this.currentUser = null;
            localStorage.removeItem('demoUser');
            localStorage.removeItem('demoSessionToken');
            this.callbacks.forEach(cb => cb(null));
        }
    }

    class MockDatabase {
        ref(path) {
            return {
                set: async (value) => {
                    localStorage.setItem('demo_' + path, JSON.stringify(value));
                },
                get: async () => {
                    const data = localStorage.getItem('demo_' + path);
                    return {
                        exists: () => !!data,
                        val: () => data ? JSON.parse(data) : null
                    };
                },
                remove: async () => {
                    localStorage.removeItem('demo_' + path);
                },
                push: () => {
                    const key = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    return {
                        key: key,
                        set: async (value) => {
                            localStorage.setItem('demo_questions/' + key, JSON.stringify(value));
                        }
                    };
                }
            };
        }
    }

    // Use mock services
    auth = new MockAuth();
    database = new MockDatabase();
    app = { demo: true };
    
    console.log('🎯 Demo Mode Active - Configure Firebase properly for production!');
} else {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        database = getDatabase(app);
        
        console.log('🔥 Firebase Active - Real database connected!');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.error('❌ Cannot start application without proper Firebase configuration');
        
        // DO NOT fallback to demo mode - throw error instead
        throw new Error(`Firebase configuration error: ${error.message}. Please check your Firebase setup.`);
    }
}

// Demo mode status (always false now)
export const DEMO_MODE = false;

// Create Google provider instance (REAL FIREBASE ONLY)
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
// Set custom parameters for better user experience
googleProvider.setCustomParameters({
    'prompt': 'select_account'
});

// Export the services
export { auth, database, app, googleProvider, signInWithPopup }; 