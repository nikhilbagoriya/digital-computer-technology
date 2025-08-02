import './custom-modal.js'; // Import custom modal first to replace Swal
import './admin-login-modal.js'; // Import admin login modal
import authManager from './auth.js';
import questionsManager from './questions.js';
import examManager from './exam.js';

class MainApp {
    constructor() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🚀 Main App initializing...');
        
        // Setup NO BROWSER ALERTS policy FIRST
        this.setupNoBrowserAlerts();
        
        // INSTANT USER CHECK: Check if user is already logged in
        this.checkExistingUser();
        
        // INSTANT WELCOME: Show content immediately on page load
        this.showInstantWelcome();
        
        // Wait a bit for auth manager to initialize
        setTimeout(() => {
            this.setupEventListeners();
            this.setupAuthStateListener();
            this.setupExamStartButtons();
            this.setupWelcomeReset(); // Setup shortcut to reset welcome modal
        }, 200);
        
        // Also check auth state periodically to ensure UI is updated
        setInterval(() => {
            this.updateButtonsVisibility();
        }, 1000);
        
        // Setup Quick Demo Test button
        this.setupQuickDemoButton();
        
        // EMERGENCY: Force buttons to be visible
        this.forceButtonsVisible();
        
        await this.loadQuestions();
        
        // Add sample questions if none exist
        setTimeout(() => {
            this.ensureSampleQuestions();
        }, 1000);
    }

    // Check if user is already logged in on page load
    checkExistingUser() {
        console.log('🔍 INSTANT: Checking for existing user on page load...');
        
        // Check for persisted user data
        const persistedUser = localStorage.getItem('persistedUser');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (persistedUser && sessionToken) {
            try {
                const userData = JSON.parse(persistedUser);
                console.log('👤 INSTANT: Found existing user:', userData.email);
                
                // Force immediate UI update for existing user
                setTimeout(() => {
                    console.log('🔄 INSTANT: Updating UI for existing user');
                    this.liveUpdateUI();
                }, 0);
                
                setTimeout(() => {
                    console.log('🔄 INSTANT: Second UI update for existing user');
                    this.liveUpdateUI();
                }, 50);
                
                setTimeout(() => {
                    console.log('🔄 INSTANT: Third UI update for existing user');
                    this.liveUpdateUI();
                }, 100);
                
            } catch (error) {
                console.error('❌ Failed to parse existing user data:', error);
            }
        } else {
            console.log('❌ No existing user found on page load');
        }
    }

    // Show instant welcome content when website loads
    showInstantWelcome() {
        console.log('🎉 Showing instant welcome content...');
        
        // Check if user has disabled welcome modal OR if it's already been shown
        const disableWelcome = localStorage.getItem('disableWelcomeModal');
        const welcomeShown = localStorage.getItem('welcomeModalShown');
        
        // DISABLE welcome modal completely - only show live features
        console.log('👀 Welcome modal disabled - showing live features only');
        this.showLiveFeatures(); // Show live features without modal
        return;
        
        // OLD CODE - DISABLED
        // Mark welcome modal as shown for this browser session
        // localStorage.setItem('welcomeModalShown', 'true');
        // console.log('📝 Welcome modal marked as shown for this session');
        
        // WELCOME MODAL DISABLED - NO POPUP
        /* 
        // Show welcome modal immediately
        setTimeout(() => {
            // COMMENTED OUT - Welcome modal disabled for better UX
        }, 500);
        */
        
        // Also show live features immediately
        this.showLiveFeatures();
    }

    // EMERGENCY: Force buttons to be visible
    forceButtonsVisible() {
        console.log('🚨 EMERGENCY: Force making buttons visible...');
        
        setTimeout(() => {
            const quickBtn = document.getElementById('quickDemoBtn');
            const loginBtn = document.getElementById('loginPromptBtn');
            const heroButtons = document.querySelector('.hero-buttons');
            
            if (heroButtons) {
                heroButtons.style.display = 'flex';
                heroButtons.style.visibility = 'visible';
                heroButtons.style.opacity = '1';
                console.log('✅ Hero buttons container made visible');
            }
            
            if (quickBtn) {
                quickBtn.style.display = 'block';
                quickBtn.style.visibility = 'visible';
                quickBtn.style.opacity = '1';
                console.log('✅ Quick Demo button made visible');
            } else {
                console.error('❌ Quick Demo button not found!');
            }
            
            if (loginBtn) {
                loginBtn.style.display = 'block';
                loginBtn.style.visibility = 'visible';
                loginBtn.style.opacity = '1';
                console.log('✅ Login button made visible');
            } else {
                console.error('❌ Login button not found!');
            }
        }, 100);
        
        // Check again after 1 second and force visible again
        setTimeout(() => {
            const quickBtn = document.getElementById('quickDemoBtn');
            const loginBtn = document.getElementById('loginPromptBtn');
            
            console.log('🔍 Button visibility check:');
            console.log('Quick Demo Button:', quickBtn ? 'Found' : 'NOT FOUND');
            console.log('Login Button:', loginBtn ? 'Found' : 'NOT FOUND');
            
            if (quickBtn) {
                quickBtn.style.display = 'block';
                quickBtn.style.visibility = 'visible';
                quickBtn.style.opacity = '1';
                console.log('Quick Demo computed style:', window.getComputedStyle(quickBtn).display);
            }
            if (loginBtn) {
                loginBtn.style.display = 'block';
                loginBtn.style.visibility = 'visible';
                loginBtn.style.opacity = '1';
                console.log('Login computed style:', window.getComputedStyle(loginBtn).display);
            }
        }, 1000);
        
        // Keep checking every 2 seconds to ensure buttons stay visible
        const keepVisible = setInterval(() => {
            const quickBtn = document.getElementById('quickDemoBtn');
            const loginBtn = document.getElementById('loginPromptBtn');
            
            if (quickBtn && !authManager.getCurrentUser()) {
                quickBtn.style.display = 'block';
                quickBtn.style.visibility = 'visible';
                quickBtn.style.opacity = '1';
            }
            if (loginBtn && !authManager.getCurrentUser()) {
                loginBtn.style.display = 'block';
                loginBtn.style.visibility = 'visible';
                loginBtn.style.opacity = '1';
            }
        }, 2000);
    }

    // Setup Quick Demo Test button
    setupQuickDemoButton() {
        const quickDemoBtn = document.getElementById('quickDemoBtn');
        if (quickDemoBtn) {
            quickDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 Quick Demo Test clicked');
                
                Swal.fire({
                    title: '🎯 Quick Demo Test',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 3rem; margin-bottom: 20px;">⚡</div>
                            <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.4rem;">Ready for a Quick Test?</h3>
                            <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
                                5 Quick Questions • 5 Minutes Timer
                            </p>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                                <div style="color: #28a745; font-weight: bold; margin-bottom: 10px;">✅ Features:</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left;">
                                    <div>✨ Beautiful Interface</div>
                                    <div>⏱️ Real-time Timer</div>
                                    <div>📊 Instant Results</div>
                                    <div>🎉 Confetti Effects</div>
                                </div>
                            </div>
                        </div>
                    `,
                    icon: 'question',
                    confirmButtonText: '<i class="fas fa-play"></i> Start Quick Test',
                    confirmButtonColor: '#667eea',
                    showCancelButton: true,
                    cancelButtonText: 'Maybe Later',
                    allowOutsideClick: false,
                    customClass: {
                        container: 'quick-demo-modal',
                        popup: 'quick-demo-popup'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        console.log('🎯 Starting Quick Demo Test...');
                        window.location.href = 'simple-demo.html';
                    }
                });
            });
        }
    }

    // Show live features on page load
    showLiveFeatures() {
        console.log('✨ Showing live features...');
        
        // Add pulse animation to course cards
        setTimeout(() => {
            const courseCards = document.querySelectorAll('.course-card');
            courseCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = 'pulse 2s ease-in-out';
                    card.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.3)';
                }, index * 200); // Staggered animation
            });
            
            // Reset animation after 3 seconds
            setTimeout(() => {
                courseCards.forEach(card => {
                    card.style.animation = '';
                    card.style.boxShadow = '';
                });
            }, 3000);
        }, 2000);
        
        // Show floating notification
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: slideInUp 0.5s ease, fadeOut 0.5s ease 4s forwards;
                cursor: pointer;
                max-width: 300px;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-size: 2rem;">🚀</div>
                    <div>
                        <div style="font-weight: bold; margin-bottom: 5px;">Ready to Excel?</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Start your first exam now!</div>
                    </div>
                    <div style="margin-left: auto; font-size: 1.2rem;">✨</div>
                </div>
            `;
            
            notification.addEventListener('click', () => {
                notification.remove();
                const coursesSection = document.getElementById('onlineTests');
                if (coursesSection) {
                    coursesSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }, 3000);
    }

    setupExamStartButtons() {
        console.log('🎯 Setting up exam start buttons...');
        
        // Add event listeners to all exam start buttons
        const examStartButtons = document.querySelectorAll('.btn-exam-start');
        
        examStartButtons.forEach(button => {
            const courseType = button.getAttribute('data-course');
            console.log('✅ Adding listener for course:', courseType);
            
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🚀 Exam start button clicked for:', courseType);
                
                // Disable button temporarily
                button.disabled = true;
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
                
                try {
                    await examManager.startExam(courseType);
                } catch (error) {
                    console.error('❌ Failed to start exam:', error);
                    
                    await Swal.fire({
                        icon: 'error',
                        title: 'Failed to Start Exam',
                        text: 'Something went wrong. Please try again.'
                    });
                } finally {
                    // Re-enable button
                    button.disabled = false;
                    button.innerHTML = originalText;
                }
            });
        });
        
        console.log(`✅ Setup complete for ${examStartButtons.length} exam buttons`);
        
        // Add global admin access function for testing
        window.directAdminAccess = () => {
            console.log('🔑 Direct admin access granted');
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminEmail', 'digitalcomputer1808@gmail.com');
            
            // Use custom modal instead of alert
            Swal.fire({
                icon: 'success',
                title: 'Admin Access Granted!',
                text: 'Redirecting to admin panel...',
                timer: 2000,
                showConfirmButton: false
            });
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
        };
    }

    async ensureSampleQuestions() {
        console.log('🔍 Checking if sample questions exist...');
        
        try {
            const result = await questionsManager.getAllQuestions();
            
            if (result.success && result.questions.length === 0) {
                console.log('📝 No questions found, adding sample questions...');
                
                const sampleQuestions = [
                    {
                        question: "What does CCC stand for?",
                        options: ["Computer Course Certificate", "Course on Computer Concepts", "Certificate Computer Course", "Computer Concepts Course"],
                        correctAnswer: 1,
                        courseType: "ccc"
                    },
                    {
                        question: "Which is the first page of a website?",
                        options: ["Homepage", "Web page", "Main page", "Index page"],
                        correctAnswer: 0,
                        courseType: "ccc"
                    },
                    {
                        question: "What does RS-CIT stand for?",
                        options: ["Rajasthan State Certificate in Information Technology", "Royal State Computer IT", "Rajasthan System Computer IT", "None of the above"],
                        correctAnswer: 0,
                        courseType: "rscit"
                    },
                    {
                        question: "Which software is used for word processing?",
                        options: ["Excel", "PowerPoint", "MS Word", "Paint"],
                        correctAnswer: 2,
                        courseType: "rscit"
                    },
                    {
                        question: "What is the shortcut key for copy?",
                        options: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"],
                        correctAnswer: 0,
                        courseType: "free-test"
                    },
                    {
                        question: "Which of the following is an operating system?",
                        options: ["Microsoft Word", "Windows 10", "Google Chrome", "Adobe Photoshop"],
                        correctAnswer: 1,
                        courseType: "ccc-subject"
                    },
                    {
                        question: "What is the full form of URL?",
                        options: ["Uniform Resource Locator", "Universal Resource Link", "Unique Resource Location", "Universal Reference Link"],
                        correctAnswer: 0,
                        courseType: "rscit-subject"
                    },
                    {
                        question: "Which key is used to delete characters to the left of cursor?",
                        options: ["Delete", "Backspace", "Ctrl+X", "Shift+Delete"],
                        correctAnswer: 1,
                        courseType: "ccc-practical"
                    },
                    {
                        question: "What does RAM stand for?",
                        options: ["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Real Access Memory"],
                        correctAnswer: 0,
                        courseType: "rscit-mock"
                    },
                    {
                        question: "Which company developed the Windows operating system?",
                        options: ["Apple", "Google", "Microsoft", "IBM"],
                        correctAnswer: 2,
                        courseType: "premium"
                    }
                ];

                // Add each sample question
                for (const questionData of sampleQuestions) {
                    await questionsManager.addQuestion(questionData);
                }

                console.log('✅ Sample questions added successfully');
            } else {
                console.log('✅ Questions already exist, no need to add samples');
            }
        } catch (error) {
            console.error('❌ Failed to check/add sample questions:', error);
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        // Student Login button
        const studentLoginBtn = document.getElementById('studentLoginBtn');
        if (studentLoginBtn) {
            console.log('✅ Student Login button found');
            studentLoginBtn.addEventListener('click', async () => {
                console.log('🔗 Student Login button clicked');
                
                // Show loading message
                Swal.fire({
                                            title: 'LogIn',
                    text: 'Please select your Google account to sign in...',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                try {
                    // Directly call Google Sign-In
                    const result = await authManager.signInWithGoogle();
                    
                    if (result.success) {
                        console.log('✅ Student Google login successful');
                        
                        // INSTANT UI Update - Multiple immediate calls
                        console.log('🔄 INSTANT: Updating UI IMMEDIATELY after login - MULTIPLE CALLS');
                        
                        // Force immediate UI updates
                        this.liveUpdateUI(); // First immediate update
                        
                        // Additional forced updates with zero delay
                        setTimeout(() => {
                            console.log('🔄 INSTANT: Main App - UI update at 0ms');
                            this.liveUpdateUI();
                        }, 0);
                        
                        setTimeout(() => {
                            console.log('🔄 INSTANT: Main App - UI update at 5ms');
                            this.liveUpdateUI();
                        }, 5);
                        
                        setTimeout(() => {
                            console.log('🔄 INSTANT: Main App - UI update at 15ms');
                            this.liveUpdateUI();
                        }, 15);
                        
                        await Swal.fire({
                            icon: 'success',
                            title: 'Welcome Student!',
                            html: `
                                <div style="text-align: center;">
                                    ${result.user.photoURL ? `<img src="${result.user.photoURL}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">` : ''}
                                    <p><strong>${result.user.displayName || 'Student'}</strong></p>
                                    <p style="color: #666; font-size: 14px;">${result.user.email}</p>
                                </div>
                            `,
                            timer: 2000,
                            showConfirmButton: false,
                            didOpen: () => {
                                // Force another UI update when modal opens
                                console.log('🔄 INSTANT: Force UI update during modal display');
                                this.liveUpdateUI();
                            }
                        });
                        
                        // Final UI update after modal
                        console.log('🔄 INSTANT: Final UI update after modal');
                        this.liveUpdateUI();
                        
                    } else {
                        console.error('❌ Student Google login failed:', result.error);
                        
                        await Swal.fire({
                            icon: 'error',
                            title: 'Login Failed',
                            text: result.error || 'Failed to sign in with Google. Please try again.',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error) {
                    console.error('❌ Student login error:', error);
                    
                    await Swal.fire({
                        icon: 'error',
                        title: 'Login Error',
                        text: 'Something went wrong. Please try again.',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('✅ Logout button found');
            logoutBtn.addEventListener('click', async () => {
                console.log('🔗 Logout button clicked');
                
                const result = await Swal.fire({
                    title: 'Logout',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Logout',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#d33'
                });
                
                if (result.isConfirmed) {
                    try {
                        const logoutResult = await authManager.logout();
                        
                        await Swal.fire({
                            icon: 'success',
                            title: 'Logged Out',
                            text: 'You have been successfully logged out.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        
                        // Update UI
                        this.updateButtonsVisibility();
                        
                    } catch (error) {
                        console.error('❌ Logout error:', error);
                        
                        await Swal.fire({
                            icon: 'info',
                            title: 'Logged Out',
                            text: 'Session ended.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        
                        // Force update UI anyway
                        this.updateButtonsVisibility();
                    }
                }
            });
        }

        // Admin button
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            console.log('✅ Admin button found');
            adminBtn.addEventListener('click', async () => {
                console.log('🔗 Admin button clicked');
                
                // Show custom admin login modal
                window.adminLoginModal.showModal();
            });
        }

        // CTA button (Start Learning Today)
        const ctaBtn = document.querySelector('.btn-cta');
        if (ctaBtn) {
            console.log('✅ CTA button (Start Learning Today) found');
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Start Learning Today button clicked');
                
                const currentUser = authManager.getCurrentUser();
                console.log('👤 Current user:', currentUser ? currentUser.email : 'Not logged in');
                
                if (currentUser) {
                    // User is logged in - scroll to questions section
                    const questionsSection = document.querySelector('.questions-section');
                    if (questionsSection) {
                        console.log('📜 Scrolling to questions section');
                        questionsSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Welcome!',
                            text: 'Practice questions are loaded below. Start solving!',
                            timer: 2000,
                            showConfirmButton: false,
                            position: 'top-end',
                            toast: true
                        });
                    } else {
                        console.warn('❌ Questions section not found');
                    }
                } else {
                    // User not logged in - redirect to login
                    console.log('🔗 Redirecting to login page');
                    Swal.fire({
                        icon: 'info',
                        title: '🚀 Ready to Start Exam?',
                        text: 'Please login first to begin your learning journey!',
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-sign-in-alt"></i> Login & Start',
                        cancelButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    });
                }
            });
        } else {
            console.warn('❌ CTA button (Start Learning Today) not found');
        }

        // Take Exam button
        const takeExamBtn = document.getElementById('takeExamBtn');
        if (takeExamBtn) {
            console.log('✅ Take Exam button found');
            takeExamBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Take Exam button clicked');
                
                const currentUser = authManager.getCurrentUser();
                
                if (currentUser) {
                    // User is logged in - redirect to exam page
                    console.log('🔗 Redirecting to exam page');
                    window.location.href = 'exam.html';
                } else {
                    // User not logged in - show login prompt
                    console.log('❌ User not logged in for exam');
                    Swal.fire({
                        icon: 'info',
                        title: '🎯 Start Your Exam!',
                        text: 'Please login first to begin your exam.',
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-play"></i> Login & Start Exam',
                        cancelButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    });
                }
            });
        }

        // Practice Questions button
        const practiceBtn = document.getElementById('practiceBtn');
        if (practiceBtn) {
            console.log('✅ Practice Questions button found');
            practiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Practice Questions button clicked');
                
                const currentUser = authManager.getCurrentUser();
                
                if (currentUser) {
                    // User is logged in - scroll to questions section
                    const questionsSection = document.querySelector('.questions-section');
                    if (questionsSection) {
                        console.log('📜 Scrolling to questions section');
                        questionsSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Practice Time!',
                            text: 'Practice questions are loaded below. Good luck!',
                            timer: 2000,
                            showConfirmButton: false,
                            position: 'top-end',
                            toast: true
                        });
                    } else {
                        console.warn('❌ Questions section not found');
                    }
                } else {
                    // User not logged in - show login prompt
                    console.log('❌ User not logged in for practice');
                    Swal.fire({
                        icon: 'info',
                        title: '📚 Start Practice!',
                        text: 'Please login first to access practice questions.',
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-book-open"></i> Login & Practice',
                        cancelButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    });
                }
            });
        }

        // Also handle navigation links smooth scrolling
        this.setupSmoothScrolling();
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Setup shortcut to reset welcome modal (for testing/admin purposes)
    setupWelcomeReset() {
        // Keyboard shortcut: Ctrl+Shift+W to reset welcome modal
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'W') {
                e.preventDefault();
                
                // Clear welcome modal settings
                localStorage.removeItem('disableWelcomeModal');
                localStorage.removeItem('welcomeModalShown');
                
                Swal.fire({
                    title: '🔄 Welcome Reset!',
                    text: 'Welcome modal will show again on next page refresh.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                
                console.log('🔄 Welcome modal settings reset by admin shortcut');
            }
            
            // Ctrl+Shift+R to reset reload modal settings
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                
                // Clear reload modal settings
                localStorage.removeItem('preventReloadDialogs');
                
                Swal.fire({
                    title: '🔄 Reload Settings Reset!',
                    text: 'Reload confirmation dialogs will show again.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                
                console.log('🔄 Reload modal settings reset by admin shortcut');
            }
        });
    }

    setupAuthStateListener() {
        console.log('🔧 Setting up LIVE auth state listener...');
        
        // Override the updateUI method from auth manager for live updates
        const originalUpdateUI = authManager.updateUI.bind(authManager);
        authManager.updateUI = () => {
            console.log('🔄 LIVE Auth Manager updateUI called');
            originalUpdateUI();
            this.liveUpdateUI();
        };
        
        // Real-time auth state monitoring - FASTER for instant feedback
        setInterval(() => {
            this.liveUpdateUI();
        }, 250); // Check every 250ms for instant updates
        
        // Force initial UI update after a short delay
        setTimeout(() => {
            console.log('🔄 Force initial LIVE UI update');
            this.liveUpdateUI();
        }, 500);
        
        // Listen for storage changes (for cross-tab sync) - LIVE
        window.addEventListener('storage', (e) => {
            if (e.key === 'demoUser' || e.key === 'sessionToken' || e.key === 'persistedUser') {
                console.log('🔄 LIVE Storage changed, updating UI');
                setTimeout(() => this.liveUpdateUI(), 100);
            }
        });

        // Listen for authentication changes - INSTANT & LIVE
        window.addEventListener('authStateChanged', (event) => {
            console.log('🔄 INSTANT: Auth state changed event received', event.detail);
            
            if (event.detail && event.detail.instant) {
                // Instant update for immediate feedback
                console.log('🔄 INSTANT: Processing instant auth state change');
                this.liveUpdateUI();
                
                // Force additional immediate updates
                setTimeout(() => this.liveUpdateUI(), 0);
                setTimeout(() => this.liveUpdateUI(), 25);
                setTimeout(() => this.liveUpdateUI(), 50);
            } else {
                // Regular update
                this.liveUpdateUI();
            }
        });

        // Listen for page visibility changes for live updates
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('🔄 Page became visible - LIVE update');
                this.liveUpdateUI();
            }
        });
    }

    // Comprehensive LIVE UI Updates
    liveUpdateUI() {
        console.log('🔄 LIVE UI Update started...');
        
        const currentUser = authManager.getCurrentUser();
        const isAdmin = authManager.isAdmin();
        
        console.log('👤 LIVE User check:', currentUser ? currentUser.email : 'None');
        console.log('🔑 LIVE Admin check:', isAdmin);
        
        // Get all UI elements
        const elements = {
            studentLoginBtn: document.getElementById('studentLoginBtn'),
            userInfo: document.getElementById('userInfo'),
            logoutBtn: document.getElementById('logoutBtn'),
            adminBtn: document.getElementById('adminBtn'),
            questionsSection: document.querySelector('.questions-section'),
            examInstructions: document.getElementById('examInstructions'),
            practiceSection: document.getElementById('practiceSection'),
            heroButtons: document.querySelector('.hero-buttons'),
            courseCards: document.querySelectorAll('.course-card'),
            examStartButtons: document.querySelectorAll('.btn-exam-start')
        };
        
        console.log('🔍 LIVE Elements found:', Object.keys(elements).reduce((acc, key) => {
            acc[key] = !!elements[key] || (elements[key] && elements[key].length > 0);
            return acc;
        }, {}));
        
        // LIVE Authentication Status Updates
        this.updateAuthenticationUI(currentUser, isAdmin, elements);
        
        // LIVE Course Cards Updates
        this.updateCourseCardsUI(currentUser, elements);
        
        // LIVE Hero Section Updates
        this.updateHeroSectionUI(currentUser, elements);
        
        // LIVE Statistics Updates
        this.updateLiveStatistics();
        
        // LIVE Button States
        this.updateButtonStates(currentUser, elements);
        
        console.log('✅ LIVE UI Update completed:', { 
            user: currentUser ? currentUser.email : null,
            isAdmin,
            timestamp: new Date().toLocaleTimeString()
        });
    }

    // LIVE Authentication UI Updates
    updateAuthenticationUI(currentUser, isAdmin, elements) {
        const { studentLoginBtn, userInfo, logoutBtn, adminBtn } = elements;
        
        // Student Login Button - LIVE
        if (studentLoginBtn) {
            if (!currentUser) {
                studentLoginBtn.style.display = 'inline-block';
                studentLoginBtn.style.visibility = 'visible';
                studentLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> LogIn';
                studentLoginBtn.classList.add('pulse-animation');
                console.log('🔄 LIVE: Student Login button shown with pulse');
            } else {
                studentLoginBtn.style.display = 'none';
                studentLoginBtn.classList.remove('pulse-animation');
                console.log('🔄 LIVE: Student Login button hidden');
            }
        }

        // User Info - ULTRA INSTANT LIVE display
        if (userInfo) {
            if (currentUser) {
                console.log('🔄 INSTANT: Showing user info for:', currentUser.email);
                
                // Force immediate visibility - NO TRANSITIONS
                userInfo.style.display = 'inline-flex';
                userInfo.style.visibility = 'visible';
                userInfo.style.alignItems = 'center';
                userInfo.style.gap = '10px';
                userInfo.style.opacity = '1'; // Immediate opacity
                userInfo.style.transform = 'translateX(0)'; // No transform delay
                userInfo.style.transition = 'none'; // Remove transitions for instant display
                
                const userName = currentUser.displayName || currentUser.email.split('@')[0];
                const userPhoto = currentUser.photoURL || '';
                
                userInfo.innerHTML = `
                    ${userPhoto ? `<img src="${userPhoto}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">` : '<i class="fas fa-user-circle" style="font-size: 24px; color: #fff;"></i>'}
                    <span style="color: #fff; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">Welcome, ${userName}</span>
                    <span class="online-indicator" style="width: 8px; height: 8px; background: #28a745; border-radius: 50%; animation: pulse 2s infinite; box-shadow: 0 0 4px #28a745;"></span>
                `;
                
                // Force layout reflow for immediate display
                userInfo.offsetHeight; // Force reflow
                
                // Add glow effect for visibility
                userInfo.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
                
                console.log('🔄 INSTANT: User info displayed IMMEDIATELY with content:', userName);
            } else {
                userInfo.style.display = 'none';
                userInfo.style.visibility = 'hidden';
                userInfo.innerHTML = '';
                userInfo.style.opacity = '0';
                console.log('🔄 INSTANT: User info hidden immediately');
            }
        }
        
        // Logout Button - LIVE
        if (logoutBtn) {
            if (currentUser) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                console.log('🔄 LIVE: Logout button shown');
            } else {
                logoutBtn.style.display = 'none';
                console.log('🔄 LIVE: Logout button hidden');
            }
        }
        
        // Admin Button - LIVE with status
        if (adminBtn) {
            adminBtn.style.display = 'inline-block';
            if (isAdmin) {
                adminBtn.innerHTML = '<i class="fas fa-crown"></i> Admin Panel';
                // adminBtn.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
                adminBtn.classList.add('admin-active');
            } else {
                adminBtn.innerHTML = '<i class="fas fa-key"></i> Admin';
                // adminBtn.style.background = 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
                adminBtn.classList.remove('admin-active');
            }
            console.log('🔄 LIVE: Admin button updated');
        }
    }

    // LIVE Course Cards Updates
    updateCourseCardsUI(currentUser, elements) {
        const { courseCards, examStartButtons } = elements;
        
        if (courseCards && courseCards.length > 0) {
            courseCards.forEach((card, index) => {
                const button = card.querySelector('.btn-exam-start');
                if (button) {
                    if (currentUser) {
                        // User logged in - enable with glow effect
                        button.disabled = false;
                        button.style.opacity = '1';
                        button.style.pointerEvents = 'auto';
                        button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        button.classList.add('ready-to-start');
                        
                        // Add live status indicator
                        if (!button.querySelector('.live-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'live-indicator';
                            indicator.innerHTML = '🟢';
                            indicator.style.cssText = 'position: absolute; top: -5px; right: -5px; animation: pulse 2s infinite;';
                            button.style.position = 'relative';
                            button.appendChild(indicator);
                        }
                    } else {
                        // User not logged in - show as locked
                        button.disabled = false;
                        button.style.opacity = '0.7';
                        button.style.pointerEvents = 'auto';
                        button.style.boxShadow = 'none';
                        button.classList.remove('ready-to-start');
                        button.innerHTML = '<i class="fas fa-play"></i> Start Exam';
                        
                        // Remove live indicator
                        const indicator = button.querySelector('.live-indicator');
                        if (indicator) {
                            indicator.remove();
                        }
                    }
                }
                
                // Add live course status
                const courseType = card.dataset.course;
                this.updateCourseStatus(card, courseType, currentUser);
            });
            
            console.log('🔄 LIVE: Course cards updated');
        }
    }

    // LIVE Hero Section Updates - FIXED TO PRESERVE OUR BUTTONS
    updateHeroSectionUI(currentUser, elements) {
        const { heroButtons } = elements;
        if (heroButtons) {
            // Only show Quick Demo Test button, remove logic for Login and Start Exam buttons
            heroButtons.innerHTML = `
                <button class="btn btn-cta" id="quickDemoBtn" style="display: block !important; visibility: visible !important;">Quick Demo Test</button>
            `;
            setTimeout(() => {
                this.setupQuickDemoButton();
            }, 100);
            console.log('🔄 LIVE: Hero buttons updated (Quick Demo only)');
        }
    }

    // LIVE Statistics Updates
    async updateLiveStatistics() {
        // Update Total Questions
        const questionsStatElement = document.getElementById('stats-total-questions');
        if (questionsStatElement) {
            try {
                const questionsResult = await questionsManager.getAllQuestions();
                if (questionsResult.success) {
                    questionsStatElement.textContent = questionsResult.questions.length;
                } else {
                    questionsStatElement.textContent = 'N/A';
                }
            } catch (error) {
                console.error("Failed to load question stats:", error);
                questionsStatElement.textContent = 'Error';
            }
        }
    }

    // LIVE Button States
    updateButtonStates(currentUser, elements) {
        const { questionsSection, examInstructions, practiceSection } = elements;
        
        // Show/hide sections based on login status
        if (currentUser) {
            if (questionsSection) {
                questionsSection.style.display = 'block';
                questionsSection.classList.add('fade-in');
            }
            if (examInstructions) {
                examInstructions.style.display = 'block';
                examInstructions.classList.add('fade-in');
            }
            if (practiceSection) {
                practiceSection.style.display = 'block';
                practiceSection.classList.add('fade-in');
            }
        } else {
            if (questionsSection) {
                questionsSection.style.display = 'none';
            }
            if (examInstructions) {
                examInstructions.style.display = 'none';
            }
            if (practiceSection) {
                practiceSection.style.display = 'none';
            }
        }
    }

    // Update individual course status
    updateCourseStatus(card, courseType, currentUser) {
        const statusElement = card.querySelector('.course-status') || this.createStatusElement(card);
        
        if (currentUser) {
            statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i> Ready';
            statusElement.style.color = '#28a745';
        } else {
            statusElement.innerHTML = '<i class="fas fa-play" style="color: #28a745;"></i> Start Exam';
            statusElement.style.color = '#28a745';
        }
    }

    // Create status element for courses
    createStatusElement(card) {
        const statusElement = document.createElement('div');
        statusElement.className = 'course-status';
        statusElement.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 12px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 12px;
            background: rgba(255,255,255,0.9);
        `;
        card.style.position = 'relative';
        card.appendChild(statusElement);
        return statusElement;
    }

    async loadQuestions() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const questionsGrid = document.getElementById('questionsGrid');
        const questionsSection = document.querySelector('.questions-section');

        if (!loadingSpinner || !questionsGrid || !questionsSection) {
            console.warn('❌ Questions elements not found');
            return;
        }

        console.log('📚 Loading questions...');

        // Check if user is logged in
        const currentUser = authManager.getCurrentUser();
        console.log('👤 Current user for questions:', currentUser ? currentUser.email : 'None');

        if (!currentUser) {
            // Hide questions section for non-logged users
            console.log('❌ User not logged in, hiding questions section');
            questionsSection.style.display = 'none';
            return;
        }

        // Show questions section for logged users
        console.log('✅ User logged in, showing questions section');
        questionsSection.style.display = 'block';

        // Show loading spinner
        loadingSpinner.style.display = 'block';
        questionsGrid.style.display = 'none';

        try {
            // Get questions from Firebase
            const result = await questionsManager.getAllQuestions();
            
            if (result.success) {
                console.log('✅ Questions loaded successfully:', result.questions.length);
                this.displayQuestions(result.questions);
            } else {
                console.error('❌ Failed to load questions:', result.error);
                this.showError('Failed to load questions: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error loading questions:', error);
            this.showError('Failed to load questions. Please try again later.');
        } finally {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            questionsGrid.style.display = 'grid';
        }
    }

    displayQuestions(questions) {
        const questionsGrid = document.getElementById('questionsGrid');
        if (!questionsGrid) return;

        // Check if user is logged in
        const currentUser = authManager.getCurrentUser();
        
        if (!currentUser) {
            // Don't display anything for non-logged users
            console.log('❌ User not logged in, not displaying questions');
            return;
        }

        if (!questions || questions.length === 0) {
            questionsGrid.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-question-circle"></i>
                    <h3>No Questions Available</h3>
                    <p>Questions will appear here once they are added by administrators.</p>
                    ${authManager.isAdmin() ? `
                        <button class="btn btn-primary" onclick="window.location.href='admin.html'">
                            <i class="fas fa-plus"></i> Add Questions
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        // Show answers only to authenticated users (which they are if we reach here)
        const showAnswers = true;
        
        questionsGrid.innerHTML = questions.map(question => `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-text">${question.question}</div>
                <ul class="options">
                    ${question.options.map((option, index) => `
                        <li class="option ${showAnswers && index === question.correctAnswer ? 'correct' : ''}" 
                            data-option-index="${index}">
                            ${String.fromCharCode(65 + index)}. ${option}
                            ${showAnswers && index === question.correctAnswer ? ' <i class="fas fa-check"></i>' : ''}
                        </li>
                    `).join('')}
                </ul>
                <div class="question-meta">
                    <small><i class="fas fa-lightbulb"></i> Correct Answer: Option ${String.fromCharCode(65 + question.correctAnswer)}</small>
                </div>
            </div>
        `).join('');
    }

    addQuestionInteractivity() {
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selections in the same question
                const questionCard = option.closest('.question-card');
                const questionOptions = questionCard.querySelectorAll('.option');
                questionOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                option.classList.add('selected');
                
                // Show login prompt
                setTimeout(() => {
                    Swal.fire({
                        icon: 'info',
                        title: '🎯 Ready to Check Answer?',
                        text: 'Login to see if your answer is correct and unlock more features!',
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-check-circle"></i> Login & Check',
                        cancelButtonText: 'Continue Browsing'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    });
                }, 500);
            });
        });
    }

    showError(message) {
        const questionsGrid = document.getElementById('questionsGrid');
        if (!questionsGrid) return;

        questionsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Questions</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }

    // Add some sample questions if none exist (for demo purposes)
    async addSampleQuestionsIfEmpty() {
        if (authManager.isAdmin()) {
            const result = await questionsManager.getAllQuestions();
            if (result.success && result.questions.length === 0) {
                const addSample = await Swal.fire({
                    title: 'No Questions Found',
                    text: 'Would you like to add some sample questions to get started?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, add samples',
                    cancelButtonText: 'No, thanks'
                });

                if (addSample.isConfirmed) {
                    Swal.fire({
                        title: 'Adding Sample Questions...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });

                    const sampleResult = await questionsManager.addSampleQuestions();
                    const successCount = sampleResult.filter(r => r.success).length;

                    Swal.close();
                    
                    if (successCount > 0) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sample Questions Added',
                            text: `${successCount} sample questions have been added successfully!`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                        
                        // Reload questions
                        this.loadQuestions();
                    }
                }
            }
        }
    }

    updateButtonsVisibility() {
        // Legacy function - now redirects to live updates
        this.liveUpdateUI();
    }

    // Global override - NO BROWSER ALERTS ALLOWED
    setupNoBrowserAlerts() {
        console.log('🚫 Setting up NO BROWSER ALERTS policy');
        
        // Override all browser dialog functions
        window.originalAlert = window.alert;
        window.originalConfirm = window.confirm;
        window.originalPrompt = window.prompt;
        
        // Replace alert with custom modal
        window.alert = (message) => {
            console.log('🚫 Blocked browser alert:', message);
            console.log('✅ Using custom modal instead');
            
            if (window.Swal) {
                window.Swal.fire({
                    icon: 'info',
                    title: 'Alert',
                    text: message,
                    confirmButtonText: 'OK'
                });
            } else {
                this.createEmergencyModal(message, 'info');
            }
        };
        
        // Replace confirm with custom modal
        window.confirm = async (message) => {
            console.log('🚫 Blocked browser confirm:', message);
            console.log('✅ Using custom modal instead');
            
            if (window.Swal) {
                const result = await window.Swal.fire({
                    icon: 'question',
                    title: 'Confirm',
                    text: message,
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel'
                });
                return result.isConfirmed;
            } else {
                return this.createEmergencyConfirm(message);
            }
        };
        
        // Replace prompt with custom modal
        window.prompt = async (message, defaultValue = '') => {
            console.log('🚫 Blocked browser prompt:', message);
            console.log('✅ Using custom modal instead');
            
            if (window.Swal) {
                const result = await window.Swal.fire({
                    icon: 'question',
                    title: 'Input Required',
                    text: message,
                    input: 'text',
                    inputValue: defaultValue,
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel'
                });
                return result.isConfirmed ? result.value : null;
            } else {
                return this.createEmergencyPrompt(message, defaultValue);
            }
        };
        
        console.log('✅ Browser alerts completely disabled - using custom modals only');
    }

    // Emergency modal for when Swal is not available
    createEmergencyModal(message, type = 'info') {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 999999;
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
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-width: 400px;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;
        
        content.innerHTML = `
            <div style="color: ${bgColor}; font-size: 3rem; margin-bottom: 15px;">
                ${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <h3 style="color: #333; margin-bottom: 15px;">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">${message}</p>
            <button onclick="this.closest('.emergency-modal').remove()" style="
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
        
        modal.className = 'emergency-modal';
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    // Emergency confirm
    createEmergencyConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                max-width: 400px;
                text-align: center;
            `;
            
            content.innerHTML = `
                <div style="color: #f39c12; font-size: 3rem; margin-bottom: 15px;">❓</div>
                <h3 style="color: #333; margin-bottom: 15px;">Confirm</h3>
                <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.resolveConfirm(true)" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">OK</button>
                    <button onclick="window.resolveConfirm(false)" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Cancel</button>
                </div>
            `;
            
            window.resolveConfirm = (result) => {
                modal.remove();
                delete window.resolveConfirm;
                resolve(result);
            };
            
            modal.appendChild(content);
            document.body.appendChild(modal);
        });
    }
}

// Additional CSS for question interactions
const additionalStyles = `
<style>
.option.selected {
    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%) !important;
    color: #2d3436 !important;
    transform: translateX(5px);
}

.question-login-prompt {
    text-align: center;
    margin-top: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.question-login-prompt a {
    color: #667eea;
    font-weight: 500;
}

.question-meta {
    text-align: center;
    margin-top: 1rem;
    padding: 0.5rem;
    background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
    color: white;
    border-radius: 6px;
    font-weight: 500;
}

.no-questions, .error-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.no-questions i, .error-message i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
}

.error-message i {
    color: #e74c3c;
}

.no-questions h3, .error-message h3 {
    color: #333;
    margin-bottom: 1rem;
}

.no-questions p, .error-message p {
    color: #666;
    margin-bottom: 2rem;
}
</style>
`;

// Add additional styles to document
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Course Cards Setup
function setupCourseCards() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        card.addEventListener('click', async function() {
            const courseType = this.dataset.course;
            const courseName = this.querySelector('h3').textContent;
            
            // Check if user is logged in
            const currentUser = authManager.getCurrentUser();
            if (!currentUser) {
                const result = await Swal.fire({
                    title: '🚀 Ready to Start Your Exam?',
                    text: 'Please login with Google to begin your learning journey!',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: '<i class="fab fa-google"></i> Login & Start Exam',
                    cancelButtonText: 'Cancel'
                });
                
                if (result.isConfirmed) {
                    // Directly trigger Google login
                    try {
                        const loginResult = await authManager.signInWithGoogle();
                        if (loginResult.success) {
                            await Swal.fire({
                                icon: 'success',
                                title: 'Login Successful!',
                                text: 'You can now access the course',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            // Continue with course selection after successful login
                        } else {
                            await Swal.fire({
                                icon: 'error',
                                title: 'Login Failed',
                                text: 'Please try again',
                                confirmButtonText: 'OK'
                            });
                            return;
                        }
                    } catch (error) {
                        await Swal.fire({
                            icon: 'error',
                            title: 'Login Error',
                            text: 'Something went wrong. Please try again.',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                } else {
                    return;
                }
            }
            
            // Handle different course types
            switch(courseType) {
                case 'free-test':
                    await Swal.fire({
                        title: 'Free Mock Test',
                        text: 'Starting your free mock test...',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    window.location.href = 'exam.html?type=free';
                    break;
                    
                case 'rscit':
                case 'ccc':
                    await Swal.fire({
                        title: `${courseName}`,
                        text: 'Starting your exam...',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    window.location.href = `exam.html?type=${courseType}`;
                    break;
                    
                case 'rscit-subject':
                case 'ccc-subject':
                    const { value: subject } = await Swal.fire({
                        title: 'Select Subject/Chapter',
                        input: 'select',
                        inputOptions: getSubjectOptions(courseType),
                        inputPlaceholder: 'Choose a subject',
                        showCancelButton: true,
                        confirmButtonText: 'Start Test',
                        cancelButtonText: 'Cancel'
                    });
                    
                    if (subject) {
                        window.location.href = `exam.html?type=${courseType}&subject=${subject}`;
                    }
                    break;
                    
                case 'rscit-mock':
                case 'ccc-practical':
                    await Swal.fire({
                        title: `${courseName}`,
                        text: 'Redirecting to specialized test interface...',
                        icon: 'info',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    window.location.href = `exam.html?type=${courseType}`;
                    break;
                    
                case 'premium':
                    const premiumResult = await Swal.fire({
                        title: 'Premium Course',
                        html: `
                            <div style="text-align: left; margin: 20px 0;">
                                <h4>Premium Features Include:</h4>
                                <ul style="margin: 15px 0;">
                                    <li>Video Lectures by Expert Teachers</li>
                                    <li>Live Doubt Clearing Sessions</li>
                                    <li>Unlimited Practice Tests</li>
                                    <li>Performance Analytics</li>
                                    <li>Study Materials & Notes</li>
                                    <li>24/7 Support</li>
                                </ul>
                                <p><strong>Price: ₹999/month</strong></p>
                            </div>
                        `,
                        icon: 'star',
                        showCancelButton: true,
                        confirmButtonText: 'Subscribe Now',
                        cancelButtonText: 'Maybe Later',
                        confirmButtonColor: '#f39c12'
                    });
                    
                    if (premiumResult.isConfirmed) {
                        await Swal.fire({
                            title: 'Payment Gateway',
                            text: 'Redirecting to payment gateway...',
                            icon: 'info',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        // Here you would integrate with payment gateway
                        // For demo, just show success message
                        setTimeout(() => {
                            Swal.fire({
                                title: 'Welcome to Premium!',
                                text: 'Your premium subscription is now active',
                                icon: 'success'
                            });
                        }, 2000);
                    }
                    break;
                    
                default:
                    await Swal.fire({
                        title: 'Coming Soon',
                        text: `${courseName} will be available soon!`,
                        icon: 'info'
                    });
            }
        });
    });
}

// Get subject options based on course type
function getSubjectOptions(courseType) {
    const subjects = {
        'rscit-subject': {
            'computer-basics': 'Computer Basics',
            'windows': 'Windows Operating System',
            'ms-word': 'MS Word',
            'ms-excel': 'MS Excel',
            'ms-powerpoint': 'MS PowerPoint',
            'internet': 'Internet & Email',
            'digital-services': 'Digital Services',
            'cyber-security': 'Cyber Security',
            'e-governance': 'E-Governance',
            'social-media': 'Social Media',
            'e-commerce': 'E-Commerce',
            'digital-payment': 'Digital Payment',
            'data-entry': 'Data Entry',
            'multimedia': 'Multimedia',
            'programming': 'Programming Basics'
        },
        'ccc-subject': {
            'computer-fundamentals': 'Computer Fundamentals',
            'operating-system': 'Operating System',
            'word-processing': 'Word Processing',
            'spreadsheet': 'Spreadsheet',
            'presentation': 'Presentation',
            'internet-www': 'Internet & WWW',
            'email': 'Email',
            'digital-literacy': 'Digital Literacy',
            'cyber-security': 'Cyber Security',
            'e-governance': 'E-Governance Applications',
            'digital-payment': 'Digital Payment Systems',
            'social-networking': 'Social Networking'
        }
    };
    
    return subjects[courseType] || {};
}

// Initialize the app
console.log('🎯 Starting Main App...');
const app = new MainApp();

// Make app globally accessible for exam.js
window.mainApp = app;

// Setup course cards after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupCourseCards();
    // Initialize the main app
    app.init();
});

// Add sample questions for admin users after a short delay
setTimeout(() => {
    app.addSampleQuestionsIfEmpty();
}, 2000);

// Mobile Menu Toggle
const initMobileMenu = () => {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    
    if (!navToggle || !nav) {
        console.error('Navigation elements not found');
        return;
    }

    // Toggle menu on hamburger click
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav.classList.toggle('active');
        
        // Toggle icon
        const icon = navToggle.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !navToggle.contains(e.target)) {
            nav.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on links
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
} 