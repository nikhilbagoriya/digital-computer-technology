import authManager from './auth.js';
import questionsManager from './questions.js';
import './custom-modal.js'; // Import custom modal to replace Swal

class ExamManager {
    constructor() {
        this.currentExam = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.examStartTime = null;
        this.examEndTime = null;
        this.completionShown = false;
        this.examCompleted = false;
        
        // Exam configurations
        this.examConfigs = {
            'rscit': { 
                name: 'RS-CIT Online Test', 
                duration: 15, // minutes
                totalQuestions: 30,
                passingMarks: 60
            },
            'rscit-subject': { 
                name: 'RS-CIT Subject-wise Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 60
            },
            'rscit-mock': { 
                name: 'RS-CIT Mock Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 60
            },
            'ccc': { 
                name: 'CCC Online Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 60
            },
            'ccc-subject': { 
                name: 'CCC Subject-wise Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 60
            },
            'ccc-practical': { 
                name: 'CCC Practical Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 60
            },
            'free-test': { 
                name: 'Free Mock Test', 
                duration: 15, 
                totalQuestions: 30,
                passingMarks: 50
            },
            'premium': {
                name: 'Premium Course Test',
                duration: 15,
                totalQuestions: 30,
                passingMarks: 60
            }
        };
    }

    // Start exam with login check
    async startExam(courseType) {
        console.log('🚀 Starting exam for course:', courseType);

        // Check if user is logged in (with persistence check)
        const currentUser = authManager.getCurrentUser();
        console.log('👤 Current user check:', currentUser ? currentUser.email : 'None');

        // Also check for persisted login state
        const persistedUser = localStorage.getItem('persistedUser');
        const sessionToken = localStorage.getItem('sessionToken');
        
        console.log('🔍 Persistence check:', {
            currentUser: !!currentUser,
            persistedUser: !!persistedUser,
            sessionToken: !!sessionToken
        });

        if (!currentUser && !persistedUser) {
            console.log('❌ User not logged in, showing login prompt');
            await this.showLoginPrompt(courseType);
            return;
        }

        // If we have persisted user but not current user, restore the session
        if (!currentUser && persistedUser) {
            console.log('🔄 Restoring persisted session...');
            try {
                const userData = JSON.parse(persistedUser);
                // Set the current user in auth manager
                authManager.currentUser = userData;
                console.log('✅ Session restored for:', userData.email);
            } catch (error) {
                console.error('❌ Failed to restore session:', error);
                // Clear invalid persisted data
                localStorage.removeItem('persistedUser');
                localStorage.removeItem('sessionToken');
                await this.showLoginPrompt(courseType);
                return;
            }
        }

        const finalUser = authManager.getCurrentUser();
        console.log('✅ User logged in:', finalUser ? finalUser.email : 'Error: No user found');
        
        if (finalUser) {
            await this.initiateExam(courseType);
        } else {
            await this.showLoginPrompt(courseType);
        }
    }

    // Show login prompt
    async showLoginPrompt(courseType) {
        const result = await Swal.fire({
            title: '🚀 Ready to Start Your Exam?',
            html: `
                <div style="text-align: center;">
                    <i class="fas fa-play-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
                    <p style="margin-bottom: 1.5rem;">Please login first to begin your exam journey!</p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: '<i class="fab fa-google"></i> Login & Start Exam',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
            console.log('🔗 User chose to login');
            
            // Show loading
            Swal.fire({
                title: 'Logging in...',
                text: 'Please select your Google account',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const loginResult = await authManager.signInWithGoogle();
                
                if (loginResult.success) {
                    console.log('✅ Login successful, starting exam');
                    
                    // INSTANT UI Update - Immediate response
                    console.log('🔄 INSTANT: Exam - Updating UI immediately after login');
                    if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                        window.mainApp.liveUpdateUI(); // Instant update
                    }
                    
                    await Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Starting your exam now...',
                        timer: 1500,
                        showConfirmButton: false,
                        didOpen: () => {
                            // Force UI update during modal
                            console.log('🔄 INSTANT: Exam - Force UI update during modal');
                            if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                                window.mainApp.liveUpdateUI();
                            }
                        }
                    });
                    
                    // Final UI update
                    console.log('🔄 INSTANT: Exam - Final UI update');
                    if (typeof window.mainApp !== 'undefined' && window.mainApp.liveUpdateUI) {
                        window.mainApp.liveUpdateUI();
                    }
                    
                    // Start exam after successful login
                    await this.initiateExam(courseType);
                } else {
                    console.error('❌ Login failed:', loginResult.error);
                    
                    await Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: loginResult.error || 'Failed to login. Please try again.'
                    });
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Error',
                    text: 'Something went wrong. Please try again.'
                });
            }
        } else {
            console.log('❌ User cancelled login');
        }
    }

    // Initiate exam after login confirmation
    async initiateExam(courseType) {
        const config = this.examConfigs[courseType];
        if (!config) {
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Course',
                text: 'The selected course is not available.'
            });
            return;
        }

        console.log('📚 Loading questions for:', config.name);

        // Show loading
        Swal.fire({
            title: 'Preparing Exam...',
            text: `Loading ${config.name} questions...`,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Get questions from the questions manager
            const questionsResult = await questionsManager.getAllQuestions();
            
            if (!questionsResult.success) {
                throw new Error('Failed to load questions');
            }

            // Filter questions by course type
            let courseQuestions = questionsResult.questions.filter(q => 
                q.courseType === courseType || 
                (courseType === 'free-test' && q.courseType) // Free test can use any questions
            );

            // If no specific questions found, use general questions for free test
            if (courseQuestions.length === 0 && courseType === 'free-test') {
                courseQuestions = questionsResult.questions.slice(0, config.totalQuestions);
            }

            if (courseQuestions.length === 0) {
                throw new Error('No questions available for this course');
            }

            // Shuffle and limit questions
            this.currentQuestions = this.shuffleArray(courseQuestions)
                .slice(0, config.totalQuestions);

            console.log(`✅ Loaded ${this.currentQuestions.length} questions for exam`);

            // Show exam instructions
            await this.showExamInstructions(config);

        } catch (error) {
            console.error('❌ Failed to prepare exam:', error);
            
            await Swal.fire({
                icon: 'error',
                title: 'Exam Preparation Failed',
                text: error.message || 'Failed to load exam questions. Please try again.'
            });
        }
    }

    // Show exam instructions
    async showExamInstructions(config) {
        const result = await Swal.fire({
            title: `${config.name}`,
            html: `
                <div style="text-align: left; margin: 1rem 0;">
                                         <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                         <p><strong>⏱️ Duration:</strong> ${config.duration} minutes</p>
                         <p><strong>❓ Questions:</strong> ${this.currentQuestions.length}</p>
                         <p><strong>✅ Passing Marks:</strong> ${config.passingMarks}%</p>
                     </div>
                     
                     <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 1.2rem;">
                                                         <li>Each question has 4 options, select the best answer</li>
                             <li>You can navigate between questions using Next/Previous</li>
                             <li>Timer will be displayed at the top</li>
                             <li>Exam will auto-submit when time expires</li>
                        </ul>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: '🚀 Start Exam',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#4caf50',
            cancelButtonColor: '#f44336',
            allowOutsideClick: false
        });

        if (result.isConfirmed) {
            console.log('🚀 User confirmed to start exam');
            this.startExamInterface(config);
        } else {
            console.log('❌ User cancelled exam start');
        }
    }

    // Start the actual exam interface
    startExamInterface(config) {
        console.log('🎯 Starting exam interface for:', config.name);
        
        this.currentExam = config;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.timeRemaining = config.duration * 60; // Convert to seconds
        this.examStartTime = new Date();
        this.completionShown = false;

        // Create exam interface
        console.log('🏗️ Creating exam interface...');
        this.createExamInterface();
        
        // Setup event listeners (THIS WAS MISSING!)
        console.log('🔧 Setting up event listeners...');
        this.setupExamEventListeners();
        
        // Verify submit button exists
        const submitBtn = document.getElementById('submitBtn');
        console.log('🔍 Submit button found:', !!submitBtn);
        if (submitBtn) {
            console.log('🎛️ Submit button display:', submitBtn.style.display);
        }
        
        // Load first question
        console.log('📚 Loading first question...');
        this.loadQuestion();
        
        // Start timer
        console.log('⏰ Starting timer...');
        this.startTimer();

        console.log('✅ Exam interface started');
        
        // Add to global scope for testing
        window.testSubmit = () => {
            console.log('🧪 TEST SUBMIT called from console');
            this.directSubmitTest();
        };
        
        // Also add global exam manager reference
        window.examManager = this;
    }

    // Create exam interface HTML
    createExamInterface() {
        // Hide main content and show exam interface
        document.body.innerHTML = `
            <div class="exam-container">
                <div class="exam-header">
                    <div class="exam-info">
                        <h2>${this.currentExam.name}</h2>
                        <div class="exam-progress">
                            Question <span id="currentQ">1</span> of <span id="totalQ">${this.currentQuestions.length}</span>
                        </div>
                    </div>
                    <div class="exam-timer">
                        <i class="fas fa-clock"></i>
                        <span id="timeDisplay">00:00:00</span>
                    </div>
                </div>
                
                <div class="exam-content">
                    <div class="question-container">
                        <div class="question-header">
                            <span class="question-number">Question <span id="qNumber">1</span></span>
                        </div>
                        <div class="question-text" id="questionText">
                            Loading question...
                        </div>
                        <div class="options-container" id="optionsContainer">
                            <!-- Options will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <div class="exam-controls">
                    <button class="btn btn-secondary" id="prevBtn" disabled>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                     <button class="btn btn-primary" id="nextBtn">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="btn btn-success" id="submitBtn">
                        <i class="fas fa-check"></i> Submit Exam
                    </button>
                    <div class="question-navigator">
                        <div class="progress-info">
                            <span id="answeredCount">0</span> of ${this.currentQuestions.length} answered
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add required styles -->
            <style>
                .exam-container {
                    min-height: 100vh;
                    background: #f8f9fa;
                    display: flex;
                    flex-direction: column;
                }
                
                .exam-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .exam-info h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                }
                
                .exam-progress {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                
                .exam-timer {
                    font-size: 1.2rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .exam-content {
                    flex: 1;
                    padding: 2rem;
                    display: flex;
                    justify-content: center;
                }
                
                .question-container {
                    max-width: 800px;
                    width: 100%;
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .question-header {
                    margin-bottom: 1.5rem;
                }
                
                .question-number {
                    background: #667eea;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .question-text {
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                    color: #333;
                }
                
                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .option {
                    padding: 1rem;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .option:hover {
                    border-color: #667eea;
                    background: #f8f9ff;
                }
                
                .option.selected {
                    border-color: #667eea;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .option-label {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #667eea;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    background: white;
                    color: #667eea;
                }
                
                .option.selected .option-label {
                    background: white;
                    color: #667eea;
                }
                
                .exam-controls {
                    background: white;
                    padding: 1.5rem 2rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }
                
                .exam-controls .btn {
                    flex-shrink: 0;
                }
                
                .question-navigator {
                    text-align: center;
                    min-width: 200px;
                }
                
                .progress-info {
                    font-weight: 500;
                    color: #666;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                

                
                /* Validation animations */
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
                    50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
                }
                
                .answer-required {
                    border-color: #f39c12 !important;
                    background: #fff3cd !important;
                    box-shadow: 0 0 10px rgba(243, 156, 18, 0.3) !important;
                }
                
                @media (max-width: 768px) {
                    .exam-header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .exam-content {
                        padding: 1rem;
                    }
                    
                    .question-container {
                        padding: 1.5rem;
                    }
                    
                    .exam-controls {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            </style>
        `;

        // Add event listeners
        this.setupExamEventListeners();
    }

    // Setup event listeners for exam interface
    setupExamEventListeners() {
        console.log('🎛️ Setting up exam event listeners...');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        console.log('🔍 Button elements found:');
        console.log('- Previous button:', !!prevBtn);
        console.log('- Next button:', !!nextBtn);
        console.log('- Submit button:', !!submitBtn);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('👈 Previous button clicked');
                this.previousQuestion();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('👉 Next button clicked');
                this.nextQuestion();
            });
        }
        
        if (submitBtn) {
            // Clear any existing listeners first
            submitBtn.replaceWith(submitBtn.cloneNode(true));
            const newSubmitBtn = document.getElementById('submitBtn');
            
            newSubmitBtn.addEventListener('click', (e) => {
                console.log('🚀 SUBMIT BUTTON CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                
                // Direct submit without modal for testing
                console.log('🎯 Direct submit test...');
                this.directSubmitTest();
            });
            
            console.log('✅ Submit button event listener added');
        } else {
            console.error('❌ Submit button not found!');
        }

        // Store beforeunload handler for later removal
        this.beforeUnloadHandler = (e) => {
            // Check both instance and global flags
            const isCompleted = this.examCompleted || window.examManagerCompleted;
            if (this.currentExam && !isCompleted) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave the exam?';
                return 'Are you sure you want to leave the exam?';
            }
        };
        
        // Prevent browser back/forward during exam (but not on result page)
        window.addEventListener('beforeunload', this.beforeUnloadHandler);

        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            if (this.currentExam) {
                e.preventDefault();
            }
        });
    }

    // Load current question
    loadQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        if (!question) {
            console.error('❌ No question found at index:', this.currentQuestionIndex);
            return;
        }

        console.log(`📚 Loading Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`);

        // Update question text
        const questionTextElement = document.getElementById('questionText');
        if (questionTextElement) {
            questionTextElement.textContent = question.question;
        }

        // Load options
        const optionsContainer = document.getElementById('optionsContainer');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.setAttribute('data-option', index);
                
                // Check if this option was previously selected
                const userAnswer = this.userAnswers[this.currentQuestionIndex];
                if (userAnswer === index) {
                    optionElement.classList.add('selected');
                }

                optionElement.innerHTML = `
                    <div class="option-label">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                `;

                optionElement.addEventListener('click', () => this.selectOption(index));
                optionsContainer.appendChild(optionElement);
            });
        }

        // Update all status indicators
        this.updateQuestionStatus();
        this.updateNavigationButtons();
        this.updateAnsweredCount();
        
        console.log(`✅ Question ${this.currentQuestionIndex + 1} loaded successfully`);
    }

    // Select an option
    selectOption(optionIndex) {
        console.log(`🎯 Option selected: Q${this.currentQuestionIndex + 1} - Option ${optionIndex + 1}`);
        
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option with smooth animation
        const selectedOption = document.querySelector(`[data-option="${optionIndex}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            
            // Visual feedback - slight pulse effect
            selectedOption.style.transform = 'scale(1.02)';
            setTimeout(() => {
                selectedOption.style.transform = 'scale(1)';
            }, 150);
        }

        // Save answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // LIVE UPDATES - Update everything immediately
        this.updateAnsweredCount();          // Update progress
        this.updateNavigationButtons();      // Update buttons
        this.updateQuestionStatus();         // Update question status
        
        console.log(`✅ Answer saved: Q${this.currentQuestionIndex + 1} = Option ${optionIndex + 1}`);
        console.log(`📊 Live update: ${Object.keys(this.userAnswers).length}/${this.currentQuestions.length} completed`);
    }

    // Update navigation buttons with live feedback
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        console.log('🔄 Live Update - Navigation buttons:', {
            currentIndex: this.currentQuestionIndex,
            totalQuestions: this.currentQuestions.length,
            isLastQuestion: this.currentQuestionIndex === this.currentQuestions.length - 1
        });

        // Previous button with live status
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
            if (this.currentQuestionIndex === 0) {
                prevBtn.style.opacity = '0.5';
            } else {
                prevBtn.style.opacity = '1';
            }
        }

        // Check if all questions are answered - LIVE COUNT
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentQuestions.length;
        const unansweredCount = totalQuestions - answeredCount;
        const allQuestionsAnswered = answeredCount === totalQuestions;

        // Check if current question is answered
        const currentQuestionAnswered = this.userAnswers[this.currentQuestionIndex] !== undefined;

        // Next/Submit button logic - SHOW SUBMIT ONLY ON LAST QUESTION
        if (this.currentQuestionIndex === this.currentQuestions.length - 1) {
            // Last question - show ONLY Submit button
            console.log('📍 Last question - showing Submit button with live status');
            
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                
                // Enable/disable submit based on current question answer
                if (currentQuestionAnswered) {
                    submitBtn.disabled = false;
                    submitBtn.title = 'Submit your exam';
                    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit Exam';
                    submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                    submitBtn.style.animation = 'pulse 2s infinite';
                } else {
                    submitBtn.disabled = true;
                    submitBtn.title = 'Please answer the current question before submitting';
                    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Answer Required';
                    submitBtn.style.background = '#f39c12';
                    submitBtn.style.animation = 'none';
                }
            }
        } else {
            // Not last question - show ONLY Next button
            console.log('➡️ Not last question - showing Next button with live status');
            
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                
                // Enable/disable next based on current question answer
                if (currentQuestionAnswered) {
                    nextBtn.disabled = false;
                    nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
                    nextBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    nextBtn.style.animation = 'none';
                } else {
                    nextBtn.disabled = true;
                    nextBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Select Answer';
                    nextBtn.style.background = '#f39c12';
                    nextBtn.style.animation = 'none';
                }
            }
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        }
    }

    // Update question status indicators
    updateQuestionStatus() {
        const currentQuestionNumber = this.currentQuestionIndex + 1;
        const totalQuestions = this.currentQuestions.length;
        const isAnswered = this.userAnswers.hasOwnProperty(this.currentQuestionIndex);
        const answeredCount = Object.keys(this.userAnswers).length;
        
        // Update question counter in header (currentQ and qNumber)
        const currentQElement = document.getElementById('currentQ');
        const qNumberElement = document.getElementById('qNumber');
        
        if (currentQElement) {
            currentQElement.textContent = currentQuestionNumber;
        }
        if (qNumberElement) {
            qNumberElement.textContent = currentQuestionNumber;
        }
        
        // Update total questions display
        const totalQElement = document.getElementById('totalQ');
        if (totalQElement) {
            totalQElement.textContent = totalQuestions;
        }
        
        // Update question counter with status icon
        const questionCounter = document.querySelector('.question-number');
        if (questionCounter) {
            const statusIcon = isAnswered ? '✅' : '❓';
            questionCounter.innerHTML = `
                <span>${statusIcon} Question ${currentQuestionNumber} of ${totalQuestions}</span>
            `;
        }
        
        // Update progress indicator
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${answeredCount} of ${totalQuestions} answered`;
        }
        
        // Update question navigation dots if they exist
        this.updateQuestionDots();
        
        console.log('🔄 Question status updated');
    }

    // Update question navigation dots
    updateQuestionDots() {
        const dotsContainer = document.getElementById('questionDots');
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        
        this.currentQuestions.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'question-dot';
            
            // Current question
            if (index === this.currentQuestionIndex) {
                dot.classList.add('current');
            }
            
            // Answered question
            if (this.userAnswers.hasOwnProperty(index)) {
                dot.classList.add('answered');
            }
            
            dot.textContent = index + 1;
            dot.addEventListener('click', () => {
                this.currentQuestionIndex = index;
                this.loadQuestion();
            });
            
            dotsContainer.appendChild(dot);
        });
    }

    // Update answered count and progress with live animations
    updateAnsweredCount() {
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentQuestions.length;
        const progressPercent = (answeredCount / totalQuestions) * 100;
        
        console.log(`🔄 Live Progress Update: ${answeredCount}/${totalQuestions} (${progressPercent.toFixed(1)}%)`);
        
        // Update answered count with animation
        const answeredCountEl = document.getElementById('answeredCount');
        if (answeredCountEl) {
            answeredCountEl.textContent = answeredCount;
            
            // Pulse animation for count update
            answeredCountEl.style.transform = 'scale(1.1)';
            answeredCountEl.style.color = '#28a745';
            setTimeout(() => {
                answeredCountEl.style.transform = 'scale(1)';
                answeredCountEl.style.color = '#2c3e50';
            }, 200);
        }
        
        // Live progress bar with smooth animation
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            // Smooth transition
            progressFill.style.transition = 'width 0.3s ease-in-out, background 0.3s ease-in-out';
            progressFill.style.width = `${progressPercent}%`;
            
            // Dynamic color based on progress
            if (answeredCount === totalQuestions) {
                // Complete - Green gradient with shine effect
                progressFill.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                progressFill.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.4)';
            } else if (progressPercent >= 75) {
                // Almost complete - Blue to green
                progressFill.style.background = 'linear-gradient(135deg, #17a2b8 0%, #28a745 100%)';
                progressFill.style.boxShadow = '0 0 15px rgba(23, 162, 184, 0.3)';
            } else if (progressPercent >= 50) {
                // Half complete - Purple to blue
                progressFill.style.background = 'linear-gradient(135deg, #667eea 0%, #17a2b8 100%)';
                progressFill.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.3)';
            } else {
                // Starting - Original purple
                progressFill.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                progressFill.style.boxShadow = 'none';
            }
        }
        
        // Update progress text with live status
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${answeredCount} of ${totalQuestions} answered (${progressPercent.toFixed(1)}%)`;
            
            // Color based on progress
            if (answeredCount === totalQuestions) {
                progressText.style.color = '#28a745';
                progressText.style.fontWeight = 'bold';
            } else {
                progressText.style.color = '#6c757d';
                progressText.style.fontWeight = 'normal';
            }
        }
        
        // Update navigation buttons after progress update
        this.updateNavigationButtons();
        
        // Show live completion notification with confetti effect
        if (answeredCount === totalQuestions && !this.completionShown) {
            this.completionShown = true;
            
            // Create confetti effect
            this.showConfettiEffect();
            
            Swal.fire({
                title: '🎉 All Questions Completed!',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin: 20px 0;">🏆</div>
                        <p style="font-size: 18px; color: #28a745;">Congratulations! You have answered all ${totalQuestions} questions.</p>
                        <p style="margin-top: 15px;">You can now submit your exam or review your answers.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Awesome!',
                timer: 4000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                }
            });
        }
    }

    // Show confetti effect for completion
    showConfettiEffect() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = '🎉';
                confetti.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: ${Math.random() * 100}%;
                    font-size: ${Math.random() * 20 + 20}px;
                    z-index: 10001;
                    pointer-events: none;
                    animation: confetti-fall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        document.body.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
    }

    // Navigate to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            console.log(`⬅️ Moving to previous question: ${this.currentQuestionIndex + 1} → ${this.currentQuestionIndex}`);
            this.currentQuestionIndex--;
            this.loadQuestion();
        } else {
            console.log('⚠️ Already at first question');
        }
    }

    // Navigate to next question with validation
    nextQuestion() {
        // Check if current question is answered
        const currentAnswer = this.userAnswers[this.currentQuestionIndex];
        
        if (currentAnswer === undefined) {
            // Show warning if no answer selected
            Swal.fire({
                icon: 'warning',
                title: '⚠️ Answer Required!',
                text: 'Please select an answer before proceeding to the next question.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#f39c12',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });
            
            // Add shake animation to options container
            const optionsContainer = document.getElementById('optionsContainer');
            if (optionsContainer) {
                optionsContainer.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    optionsContainer.style.animation = '';
                }, 500);
            }
            
            return; // Don't proceed to next question
        }
        
        // Proceed to next question if answer is selected
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
        }
    }

    // Start exam timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            // Auto-submit when time expires
            if (this.timeRemaining <= 0) {
                this.timeExpired();
            }
        }, 1000);
    }

    // Update timer display with live warnings
    updateTimerDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;

        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timeDisplay.textContent = timeString;
            
            // Live warning system with animations and colors
            if (this.timeRemaining <= 300) { // 5 minutes - CRITICAL
                timeDisplay.style.color = '#ff4757';
                timeDisplay.style.fontWeight = 'bold';
                timeDisplay.style.animation = 'blink 1s infinite';
                timeDisplay.style.textShadow = '0 0 10px #ff4757';
                
                // Show critical warning (only once per minute)
                if (this.timeRemaining % 60 === 0 && this.timeRemaining <= 300 && this.timeRemaining > 0) {
                    this.showTimeWarning(`⚠️ Only ${Math.floor(this.timeRemaining / 60)} minutes left!`, 'error');
                }
                
            } else if (this.timeRemaining <= 600) { // 10 minutes - WARNING
                timeDisplay.style.color = '#ffa502';
                timeDisplay.style.fontWeight = 'bold';
                timeDisplay.style.animation = 'pulse 2s infinite';
                timeDisplay.style.textShadow = '0 0 5px #ffa502';
                
            } else if (this.timeRemaining <= 900) { // 15 minutes - CAUTION
                timeDisplay.style.color = '#f39c12';
                timeDisplay.style.fontWeight = 'normal';
                timeDisplay.style.animation = 'none';
                timeDisplay.style.textShadow = 'none';
                
            } else { // Normal time
                timeDisplay.style.color = '#2c3e50';
                timeDisplay.style.fontWeight = 'normal';
                timeDisplay.style.animation = 'none';
                timeDisplay.style.textShadow = 'none';
            }
        }
    }

    // Show live time warnings
    showTimeWarning(message, type = 'warning') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : '#ffa502'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Handle time expiry
    async timeExpired() {
        clearInterval(this.timerInterval);
        
        await Swal.fire({
            icon: 'warning',
            title: 'Time Up!',
            text: 'Your exam time has expired. Submitting your answers...',
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 3000
        });

        this.submitExam();
    }

    // Direct submit test (bypassing modal)
    directSubmitTest() {
        console.log('🧪 Direct submit test started');
        
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentQuestions.length;
        
        console.log(`📊 Direct Stats: ${answeredCount}/${totalQuestions} answered`);
        
        // Direct submit without any confirmation
        console.log('✅ Submitting directly...');
        this.submitExam();
    }

    // Confirm exam submission with validation
    async confirmSubmitExam() {
        console.log('🎯 Confirm Submit Exam called');
        
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentQuestions.length;
        const unansweredCount = totalQuestions - answeredCount;

        console.log(`📊 Stats: ${answeredCount}/${totalQuestions} answered, ${unansweredCount} unanswered`);

        // Check if current question (last question) is answered
        const currentAnswer = this.userAnswers[this.currentQuestionIndex];
        
        if (currentAnswer === undefined) {
            // Show warning for current unanswered question
            await Swal.fire({
                icon: 'warning',
                title: '⚠️ Current Question Not Answered!',
                html: `
                    <p>Please answer the current question before submitting the exam.</p>
                    <p style="color: #f39c12; margin-top: 15px;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        You are on question ${this.currentQuestionIndex + 1} which is not answered yet.
                    </p>
                `,
                confirmButtonText: 'OK, Let me answer',
                confirmButtonColor: '#f39c12',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });
            
            // Add shake animation to options container
            const optionsContainer = document.getElementById('optionsContainer');
            if (optionsContainer) {
                optionsContainer.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    optionsContainer.style.animation = '';
                }, 500);
            }
            
            return; // Don't allow submission
        }

        // Removed browser confirm - using custom modal only

        let confirmationHtml = `<p>You have answered <strong>${answeredCount}</strong> out of <strong>${totalQuestions}</strong> questions.</p>`;
        
        if (unansweredCount > 0) {
            confirmationHtml += `<p style="color: #f39c12; margin-top: 15px;"><i class="fas fa-exclamation-triangle"></i> ${unansweredCount} questions are unanswered and will be marked as incorrect.</p>`;
        }

        console.log('📝 Showing confirmation dialog...');

        try {
            const result = await Swal.fire({
                title: 'Submit Exam?',
                html: confirmationHtml,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Continue Exam',
                confirmButtonColor: 'success',
                cancelButtonColor: 'secondary'
            });

            console.log('🔄 Dialog result:', result);

            if (result.isConfirmed) {
                console.log('✅ User confirmed submission');
                this.submitExam();
            } else {
                console.log('❌ User cancelled submission');
            }
        } catch (error) {
            console.error('❌ Error with custom modal:', error);
            console.log('🔄 Retrying with simple modal...');
            
            // Simple fallback modal without complex features
            const simpleResult = await Swal.fire({
                title: 'Submit Exam?',
                text: 'Are you sure you want to submit your exam?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Submit',
                cancelButtonText: 'Cancel'
            });
            
            if (simpleResult.isConfirmed) {
                this.submitExam();
            }
        }
    }

    // Submit exam and show results
    async submitExam() {
        console.log('📤 Submitting exam...');
        
        try {
            // Stop timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                console.log('⏰ Timer stopped');
            }

            this.examEndTime = new Date();
            console.log('⏱️ Exam end time set:', this.examEndTime);
            
            // Show simple loading message
            console.log('💫 Processing results...');

            // Calculate results
            console.log('🧮 Calculating results...');
            const results = this.calculateResults();
            console.log('📊 Results calculated:', results);
            
            // Save exam result
            console.log('💾 Saving exam result...');
            await this.saveExamResult(results);
            
            // Show results immediately for testing
            console.log('🎉 Showing results immediately...');
            this.showSimpleResults(results);
            
        } catch (error) {
            console.error('❌ Error in submitExam:', error);
            
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong while processing your exam. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    // Calculate exam results
    calculateResults() {
        let correctAnswers = 0;
        let totalQuestions = this.currentQuestions.length;
        let answeredQuestions = Object.keys(this.userAnswers).length;
        
        const questionResults = [];

        this.currentQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                correctAnswers++;
            }

            questionResults.push({
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
                isAnswered: userAnswer !== undefined
            });
        });

        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
        const timeTaken = this.examEndTime - this.examStartTime;
        const timeTakenMinutes = Math.floor(timeTaken / (1000 * 60));
        const timeTakenSeconds = Math.floor((timeTaken % (1000 * 60)) / 1000);

        const passed = scorePercentage >= this.currentExam.passingMarks;

        return {
            examName: this.currentExam.name,
            totalQuestions,
            answeredQuestions,
            correctAnswers,
            incorrectAnswers: answeredQuestions - correctAnswers,
            unansweredQuestions: totalQuestions - answeredQuestions,
            scorePercentage,
            passingMarks: this.currentExam.passingMarks,
            passed,
            timeTaken: `${timeTakenMinutes}:${timeTakenSeconds.toString().padStart(2, '0')}`,
            startTime: this.examStartTime,
            endTime: this.examEndTime,
            questionResults,
            user: authManager.getCurrentUser()
        };
    }

    // Save exam result
    async saveExamResult(results) {
        try {
            // Here you can implement saving to database/localStorage
            const resultId = 'exam_result_' + Date.now();
            const resultData = {
                id: resultId,
                ...results,
                savedAt: new Date().toISOString()
            };

            // Save to localStorage for now
            localStorage.setItem(resultId, JSON.stringify(resultData));
            
            // Also save to a general results array
            const allResults = JSON.parse(localStorage.getItem('exam_results') || '[]');
            allResults.push(resultData);
            localStorage.setItem('exam_results', JSON.stringify(allResults));

            console.log('✅ Exam result saved:', resultId);
        } catch (error) {
            console.error('❌ Failed to save exam result:', error);
        }
    }

    // Show simple results (for testing)
    showSimpleResults(results) {
        console.log('📊 EXAM RESULTS:', results);
        
        // IMMEDIATELY mark exam as completed to disable beforeunload warning
        this.examCompleted = true;
        window.examManagerCompleted = true;
        this.currentExam = null;
        
        // Force clear all beforeunload listeners immediately
        window.onbeforeunload = null;
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
        
        // Simple results display
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    max-width: 500px;
                    width: 90%;
                ">
                    <h1 style="color: ${results.passed ? '#4caf50' : '#f44336'}; margin-bottom: 1rem;">
                        ${results.passed ? '🎉 PASSED!' : '❌ FAILED'}
                    </h1>
                    <h2 style="font-size: 3rem; margin: 1rem 0; color: #333;">
                        ${results.scorePercentage}%
                    </h2>
                    <p style="font-size: 1.2rem; margin-bottom: 1.5rem; color: #666;">
                        ${results.examName}
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="font-size: 1.5rem; color: #4caf50;">✅ ${results.correctAnswers}</div>
                            <div style="color: #666;">Correct</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="font-size: 1.5rem; color: #f44336;">❌ ${results.incorrectAnswers}</div>
                            <div style="color: #666;">Incorrect</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="font-size: 1.5rem; color: #ff9800;">❓ ${results.unansweredQuestions}</div>
                            <div style="color: #666;">Unanswered</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="font-size: 1.5rem; color: #2196f3;">⏱️ ${results.timeTaken}</div>
                            <div style="color: #666;">Time</div>
                        </div>
                    </div>
                    <div style="
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        flex-wrap: wrap;
                    ">
                        <button onclick="examManager.goBackToHome()" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            min-width: 180px;
                        ">🏠 Back to Home</button>
                        <button onclick="examManager.showQuestionSummary()" style="
                            background: linear-gradient(135deg, #2196f3, #64b5f6);
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            min-width: 180px;
                        ">📋 Question Summary</button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Simple results displayed');
    }

    // Show exam results
    showResults(results) {
        Swal.close();
        
        // IMMEDIATELY mark exam as completed to disable beforeunload warning
        this.examCompleted = true;
        window.examManagerCompleted = true;
        this.currentExam = null;
        
        // Force clear all beforeunload listeners immediately
        window.onbeforeunload = null;
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
        
        // Create results interface
        document.body.innerHTML = `
            <div class="results-container">
                <div class="results-header">
                    <div class="results-icon">
                        <i class="fas ${results.passed ? 'fa-trophy' : 'fa-times-circle'}" 
                           style="color: ${results.passed ? '#4caf50' : '#f44336'}"></i>
                    </div>
                    <h1>${results.passed ? 'Congratulations!' : 'Better Luck Next Time!'}</h1>
                    <p class="results-subtitle">${results.examName}</p>
                </div>

                <div class="results-content">
                    <div class="score-card ${results.passed ? 'passed' : 'failed'}">
                        <div class="score-percentage">
                            ${results.scorePercentage}%
                        </div>
                        <div class="score-status">
                            ${results.passed ? 'PASSED' : 'FAILED'}
                        </div>
                        <div class="passing-marks">
                            Passing Marks: ${results.passingMarks}%
                        </div>
                    </div>

                    <div class="results-stats">
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="stat-details">
                                <div class="stat-number">${results.correctAnswers}</div>
                                <div class="stat-label">Correct</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                            <div class="stat-details">
                                <div class="stat-number">${results.incorrectAnswers}</div>
                                <div class="stat-label">Incorrect</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-question-circle"></i></div>
                            <div class="stat-details">
                                <div class="stat-number">${results.unansweredQuestions}</div>
                                <div class="stat-label">Unanswered</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-details">
                                <div class="stat-number">${results.timeTaken}</div>
                                <div class="stat-label">Time Taken</div>
                            </div>
                        </div>
                    </div>

                    <div class="results-actions">
                        <button class="btn btn-primary" id="viewDetailedBtn">
                            <i class="fas fa-list"></i> View Detailed Results
                        </button>
                        <button class="btn btn-secondary" onclick="examManager.goBackToHome()">
                            <i class="fas fa-home"></i> Back to Home
                        </button>
                        <button class="btn btn-info" onclick="examManager.showQuestionSummary()">
                            <i class="fas fa-list-alt"></i> Question Summary
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .results-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem;
                }

                .results-header {
                    text-align: center;
                    color: white;
                    margin-bottom: 2rem;
                }

                .results-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .results-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .results-subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                }

                .results-content {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 100%;
                }

                .score-card {
                    text-align: center;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .score-card.passed {
                    background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
                    color: white;
                }

                .score-card.failed {
                    background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
                    color: white;
                }

                .score-percentage {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .score-status {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .passing-marks {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .results-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .stat-icon {
                    font-size: 1.5rem;
                    color: #667eea;
                }

                .stat-number {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #333;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: #666;
                }

                .results-actions {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .results-actions .btn {
                    justify-content: center;
                }

                @media (max-width: 768px) {
                    .results-container {
                        padding: 1rem;
                    }

                    .results-header h1 {
                        font-size: 2rem;
                    }

                    .results-content {
                        padding: 1.5rem;
                    }

                    .results-stats {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        // Add event listener for detailed results
        setTimeout(() => {
            const viewDetailedBtn = document.getElementById('viewDetailedBtn');
            if (viewDetailedBtn) {
                viewDetailedBtn.addEventListener('click', () => {
                    this.showDetailedResults(results);
                });
            }
        }, 100);

        console.log('✅ Results displayed:', results);
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Show detailed results with question-by-question analysis
    showDetailedResults(results) {
        console.log('📊 Showing detailed results...');

        document.body.innerHTML = `
            <div class="detailed-results-container">
                <div class="detailed-header">
                    <button class="btn btn-secondary back-btn" onclick="history.back()">
                        <i class="fas fa-arrow-left"></i> Back to Results
                    </button>
                    <h1>Detailed Results</h1>
                    <div class="exam-summary">
                        <span class="exam-name">${results.examName}</span>
                        <span class="final-score ${results.passed ? 'passed' : 'failed'}">
                            ${results.scorePercentage}% ${results.passed ? 'PASSED' : 'FAILED'}
                        </span>
                    </div>
                </div>

                <div class="questions-review">
                    ${results.questionResults.map((qResult, index) => `
                        <div class="question-review-card ${qResult.isCorrect ? 'correct' : qResult.isAnswered ? 'incorrect' : 'unanswered'}">
                            <div class="question-header">
                                <div class="question-number">Question ${index + 1}</div>
                                <div class="question-status">
                                    ${qResult.isCorrect ? 
                                        '<i class="fas fa-check-circle"></i> Correct' : 
                                        qResult.isAnswered ? 
                                            '<i class="fas fa-times-circle"></i> Incorrect' : 
                                            '<i class="fas fa-question-circle"></i> Unanswered'
                                    }
                                </div>
                            </div>
                            
                            <div class="question-content">
                                <div class="question-text">${qResult.question}</div>
                                
                                <div class="options-review">
                                    ${qResult.options.map((option, optIndex) => `
                                        <div class="option-review ${
                                            optIndex === qResult.correctAnswer ? 'correct-answer' : 
                                            optIndex === qResult.userAnswer && optIndex !== qResult.correctAnswer ? 'wrong-answer' : 
                                            optIndex === qResult.userAnswer ? 'user-correct' : ''
                                        }">
                                            <div class="option-label">${String.fromCharCode(65 + optIndex)}</div>
                                            <div class="option-text">${option}</div>
                                            <div class="option-indicator">
                                                ${optIndex === qResult.correctAnswer ? 
                                                    '<i class="fas fa-check"></i>' : 
                                                    optIndex === qResult.userAnswer && optIndex !== qResult.correctAnswer ? 
                                                        '<i class="fas fa-times"></i>' : ''
                                                }
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <div class="answer-explanation">
                                    ${qResult.isCorrect ? 
                                        '<i class="fas fa-thumbs-up"></i> Well done! You selected the correct answer.' :
                                        qResult.isAnswered ?
                                            `<i class="fas fa-info-circle"></i> You selected option ${String.fromCharCode(65 + qResult.userAnswer)}, but the correct answer is option ${String.fromCharCode(65 + qResult.correctAnswer)}.` :
                                            `<i class="fas fa-exclamation-triangle"></i> You didn't answer this question. The correct answer is option ${String.fromCharCode(65 + qResult.correctAnswer)}.`
                                    }
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="detailed-footer">
                    <div class="summary-stats">
                        <div class="summary-stat correct">
                            <i class="fas fa-check-circle"></i>
                            <span>${results.correctAnswers} Correct</span>
                        </div>
                        <div class="summary-stat incorrect">
                            <i class="fas fa-times-circle"></i>
                            <span>${results.incorrectAnswers} Incorrect</span>
                        </div>
                        <div class="summary-stat unanswered">
                            <i class="fas fa-question-circle"></i>
                            <span>${results.unansweredQuestions} Unanswered</span>
                        </div>
                    </div>
                    
                    <div class="footer-actions">
                        <button class="btn btn-secondary" onclick="examManager.goBackToHome()">
                            <i class="fas fa-home"></i> Back to Home
                        </button>
                        <button class="btn btn-info" onclick="examManager.showQuestionSummary()">
                            <i class="fas fa-list-alt"></i> Question Summary
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .detailed-results-container {
                    min-height: 100vh;
                    background: #f8f9fa;
                    padding: 1rem;
                }

                .detailed-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .detailed-header h1 {
                    flex: 1;
                    margin: 0;
                    font-size: 1.8rem;
                    text-align: center;
                }

                .back-btn {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                }

                .back-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .exam-summary {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .exam-name {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .final-score {
                    font-weight: bold;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                }

                .final-score.passed {
                    background: rgba(76, 175, 80, 0.2);
                    color: #4caf50;
                }

                .final-score.failed {
                    background: rgba(244, 67, 54, 0.2);
                    color: #f44336;
                }

                .questions-review {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .question-review-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border-left: 4px solid;
                }

                .question-review-card.correct {
                    border-left-color: #4caf50;
                }

                .question-review-card.incorrect {
                    border-left-color: #f44336;
                }

                .question-review-card.unanswered {
                    border-left-color: #ff9800;
                }

                .question-header {
                    background: #f8f9fa;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e9ecef;
                }

                .question-number {
                    font-weight: 600;
                    color: #333;
                }

                .question-status {
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .question-status i {
                    font-size: 1.1rem;
                }

                .question-review-card.correct .question-status {
                    color: #4caf50;
                }

                .question-review-card.incorrect .question-status {
                    color: #f44336;
                }

                .question-review-card.unanswered .question-status {
                    color: #ff9800;
                }

                .question-content {
                    padding: 1.5rem;
                }

                .question-text {
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                    color: #333;
                    line-height: 1.6;
                }

                .options-review {
                    margin-bottom: 1.5rem;
                }

                .option-review {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    border-radius: 8px;
                    border: 2px solid transparent;
                }

                .option-review.correct-answer {
                    background: #e8f5e8;
                    border-color: #4caf50;
                    color: #2e7d32;
                }

                .option-review.wrong-answer {
                    background: #ffebee;
                    border-color: #f44336;
                    color: #c62828;
                }

                .option-review.user-correct {
                    background: #e8f5e8;
                    border-color: #4caf50;
                    color: #2e7d32;
                }

                .option-label {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }

                .option-review.correct-answer .option-label {
                    background: #4caf50;
                    color: white;
                }

                .option-review.wrong-answer .option-label {
                    background: #f44336;
                    color: white;
                }

                .option-review:not(.correct-answer):not(.wrong-answer) .option-label {
                    background: #e9ecef;
                    color: #495057;
                }

                .option-text {
                    flex: 1;
                }

                .option-indicator {
                    font-size: 1.2rem;
                    font-weight: bold;
                }

                .option-review.correct-answer .option-indicator {
                    color: #4caf50;
                }

                .option-review.wrong-answer .option-indicator {
                    color: #f44336;
                }

                .answer-explanation {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                    font-size: 0.95rem;
                    color: #495057;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .answer-explanation i {
                    color: #007bff;
                    flex-shrink: 0;
                }

                .detailed-footer {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .summary-stats {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .summary-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .summary-stat.correct {
                    color: #4caf50;
                }

                .summary-stat.incorrect {
                    color: #f44336;
                }

                .summary-stat.unanswered {
                    color: #ff9800;
                }

                .footer-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .detailed-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .detailed-header h1 {
                        order: -1;
                        margin-bottom: 1rem;
                    }

                    .question-header {
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }

                    .summary-stats {
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                    }

                    .footer-actions {
                        flex-direction: column;
                    }
                }   
            </style>
        `;

        console.log('✅ Detailed results displayed');
    }

    // Show Question Summary Modal
    showQuestionSummary() {
        if (!this.currentQuestions || this.currentQuestions.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Questions Available',
                text: 'No question data available to show summary.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Create detailed analysis for each question
        const questionResults = this.currentQuestions.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isAnswered = userAnswer !== undefined;
            
            // Get correct answer index with fallback options
            let correctAnswerIndex;
            if (question.correct !== undefined) {
                correctAnswerIndex = parseInt(question.correct);
            } else if (question.correctAnswer !== undefined) {
                correctAnswerIndex = parseInt(question.correctAnswer);
            } else if (question.answer !== undefined) {
                correctAnswerIndex = parseInt(question.answer);
            } else {
                correctAnswerIndex = 0; // fallback
            }
            
            const userAnswerIndex = parseInt(userAnswer);
            const isCorrect = isAnswered && userAnswerIndex === correctAnswerIndex;
            
            return {
                question: question.question,
                options: question.options,
                correctAnswer: correctAnswerIndex,
                userAnswer: userAnswerIndex,
                isAnswered: isAnswered,
                isCorrect: isCorrect
            };
        });

        // Create modal HTML
        const modalHTML = `
            <div id="questionSummaryModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                overflow-y: auto;
            ">
                <div class="question-summary-modal-main1" style="
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    margin: 2rem;
                ">
                    <div class="question-summary-modal-main2" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 1.5rem;
                        border-radius: 12px 12px 0 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h2 class="question-summary-modal-main2-h2" style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem !important;">
                            <i class="fas fa-list-alt"></i> Question Summary
                        </h2>
                        <button onclick="document.getElementById('questionSummaryModal').remove()" style="
                            background: rgba(255,255,255,0.2);
                            border: none;
                            color: white;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="question-summary-modal-main3" style="padding: 1.5rem;">
                        ${questionResults.map((result, index) => {
                            const statusClass = result.isCorrect ? 'correct' : result.isAnswered ? 'incorrect' : 'unanswered';
                            const statusColor = result.isCorrect ? '#4caf50' : result.isAnswered ? '#f44336' : '#ff9800';
                            const statusText = result.isCorrect ? 'Correct' : result.isAnswered ? 'Incorrect' : 'Unanswered';
                            const statusIcon = result.isCorrect ? 'fa-check-circle' : result.isAnswered ? 'fa-times-circle' : 'fa-question-circle';
                            
                            return `
                                <div class="question-summary-modal-question1" style="
                                    background: white;
                                    border: 1px solid #e9ecef;
                                    border-left: 4px solid ${statusColor};
                                    border-radius: 8px;
                                    margin-bottom: 1rem;
                                    overflow: hidden;
                                ">
                                    <div class="question-summary-modal-question2" style="
                                        background: #f8f9fa;
                                        padding: 1rem;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        border-bottom: 1px solid #e9ecef;
                                    ">
                                        <span style="font-weight: 600;">Question ${index + 1}</span>
                                        <span class="question-summary-modal-icons1" style="
                                            color: ${statusColor};
                                            font-weight: 500;
                                            display: flex;
                                            align-items: center;
                                            gap: 0.5rem;
                                        ">
                                            <i class="fas ${statusIcon}"></i> ${statusText}
                                        </span>
                                    </div>
                                    
                                    <div class="question-summary-modal-alloptionsincon" style="padding: 1.5rem;">
                                        <div class="question-summary-modal-question4" style="
                                            font-size: 0.9rem;
                                            margin-bottom: 0.7rem;
                                            color: #333;
                                            line-height: 1.6;
                                            font-weight: 700;
                                        ">${result.question}</div>
                                        
                                        <div class="question-summary-modal-options1" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                            ${result.options.map((option, optionIndex) => {
                                                const isUserChoice = result.isAnswered && optionIndex === result.userAnswer;
                                                const isCorrectAnswer = optionIndex === result.correctAnswer;
                                                
                                                // Color logic: 
                                                // Green: Correct answer (whether user selected or not)
                                                // Red: User's wrong selection
                                                // Gray: Not selected
                                                let backgroundColor, icon, textColor;
                                                
                                                if (isCorrectAnswer) {
                                                    // Correct answer is always green
                                                    backgroundColor = '#d4edda';
                                                    textColor = '#155724';
                                                    icon = '✓';
                                                } else if (isUserChoice) {
                                                    // User's wrong selection is red
                                                    backgroundColor = '#f8d7da';
                                                    textColor = '#721c24';
                                                    icon = '✗';
                                                } else {
                                                    // Unselected options are gray
                                                    backgroundColor = '#f8f9fa';
                                                    textColor = '#6c757d';
                                                    icon = '';
                                                }
                                                
                                                return `<div style="
                                                    background-color: ${backgroundColor};
                                                    padding: 0.5rem 0.35rem;
                                                    border-radius: 6px;
                                                    border: 2px solid ${isCorrectAnswer ? '#28a745' : isUserChoice ? '#dc3545' : '#dee2e6'};
                                                    color: ${textColor};
                                                    font-weight: ${isCorrectAnswer || isUserChoice ? '600' : '400'};
                                                    display: flex;
                                                    align-items: center;
                                                    gap: 0.5rem;
                                                ">
                                                    <span class="question-summary-modal-foroptions-iconright-wrong" style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
                                                    <span class="question-summary-modal-foroptions" style="font-size: 0.9rem; font-weight: 700; color: #000000d9 !important;">${option}</span>
                                                    ${isCorrectAnswer ? '<span class="question-summary-modal-foroptions-correct" style="margin-left: auto; font-size: 0.7rem; font-weight: 600; color: #28a745;">(CORRECT)</span>' : ''}
                                                    ${isUserChoice && !isCorrectAnswer ? '<span class="question-summary-modal-foroptions-incorrect" style="margin-left: auto; font-size: 0.8rem; font-weight: bold; color: #dc3545;">(YOUR CHOICE)</span>' : ''}
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        <div style="
                            background: #f8f9fa;
                            padding: 1.5rem;
                            border-radius: 8px;
                            margin-top: 1rem;
                            text-align: center;
                        ">
                            <div style="
                                display: flex;
                                justify-content: center;
                                gap: 2rem;
                                margin-bottom: 1rem;
                                flex-wrap: wrap;
                            ">
                                <div style="color: #4caf50; font-weight: 500;">
                                    <i class="fas fa-check-circle"></i> ${questionResults.filter(q => q.isCorrect).length} Correct
                                </div>
                                <div style="color: #f44336; font-weight: 500;">
                                    <i class="fas fa-times-circle"></i> ${questionResults.filter(q => q.isAnswered && !q.isCorrect).length} Incorrect
                                </div>
                                <div style="color: #ff9800; font-weight: 500;">
                                    <i class="fas fa-question-circle"></i> ${questionResults.filter(q => !q.isAnswered).length} Unanswered
                                </div>
                            </div>
                            <button onclick="document.getElementById('questionSummaryModal').remove()" style="
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                color: white;
                                border: none;
                                padding: 0.75rem 2rem;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 1rem;
                            ">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add close functionality on background click
        const modal = document.getElementById('questionSummaryModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Go back to home without any confirmation
    goBackToHome() {
        // Mark as completed to disable beforeunload (multiple ways)
        this.examCompleted = true;
        window.examManagerCompleted = true;
        
        // Also clear exam state
        this.currentExam = null;
        
        // Remove the beforeunload event listener completely
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
        
        // Force clear all beforeunload listeners
        window.onbeforeunload = null;
        
        // Navigate to home
        window.location.href = 'index.html';
    }

    // Retake exam
    retakeExam() {
        this.currentExam = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.timeRemaining = 0;
        this.examStartTime = null;
        this.examEndTime = null;
        this.examCompleted = false;
        
        window.location.href = 'index.html';
    }
}

// Create global exam manager instance
const examManager = new ExamManager();

// Export for global use
window.examManager = examManager;

// Global override for beforeunload to prevent dialogs on result pages
(function() {
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'beforeunload') {
            const wrappedListener = function(event) {
                // Check if exam is completed
                if (window.examManagerCompleted || 
                    (window.examManager && window.examManager.examCompleted)) {
                    return; // Don't show any dialog
                }
                return listener.call(this, event);
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
})();

export default examManager; 