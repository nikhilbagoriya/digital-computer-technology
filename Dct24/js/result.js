class ResultManager {
    constructor() {
        this.examResults = null;
        this.showingAnswers = 'all';
        
        this.initializeResults();
    }

    async initializeResults() {
        try {
            // Check authentication
            if (!AuthManager.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            // Update header authentication UI
            this.updateHeaderAuth();

            // Load exam results
            this.loadExamResults();
            
            // Display results
            this.displayResults();
            
            // Initialize event listeners
            this.bindEventListeners();
            
            console.log('Results initialized successfully');
        } catch (error) {
            console.error('Failed to initialize results:', error);
            this.showErrorMessage('Failed to load exam results. Please try again.');
        }
    }

    updateHeaderAuth() {
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const currentUser = AuthManager.getCurrentUser();
        
        if (currentUser) {
            // User is logged in
            if (userInfo) {
                userInfo.textContent = `${currentUser.email} - Results`;
            }
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
        } else {
            // User is not logged in
            if (userInfo) {
                userInfo.textContent = 'Not Logged In';
            }
            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }

    loadExamResults() {
        const resultsData = localStorage.getItem('examResults');
        if (!resultsData) {
            throw new Error('No exam results found');
        }
        
        this.examResults = JSON.parse(resultsData);
        console.log('Exam results loaded:', this.examResults);
    }

    displayResults() {
        this.displayResultHeader();
        this.displayScoreSection();
        this.displaySummarySection();
        this.displayAnalysisSection();
        this.displayQuestionReview();
        this.initializeCharts();
    }

    displayResultHeader() {
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        
        if (resultIcon) {
            const iconClass = this.examResults.passed ? 'pass' : 'fail';
            const iconSymbol = this.examResults.passed ? 'fa-trophy' : 'fa-times-circle';
            
            resultIcon.className = `result-icon ${iconClass}`;
            resultIcon.innerHTML = `<i class="fas ${iconSymbol}"></i>`;
        }
        
        if (resultTitle) {
            const titleClass = this.examResults.passed ? 'pass' : 'fail';
            const titleText = this.examResults.passed ? 'Congratulations!' : 'Better Luck Next Time!';
            
            resultTitle.className = `${titleClass}`;
            resultTitle.textContent = titleText;
        }
        
        if (resultMessage) {
            const message = this.examResults.passed ? 
                'You have successfully passed the exam!' : 
                'You need to score at least 60% to pass. Keep practicing!';
            
            resultMessage.textContent = message;
        }
    }

    displayScoreSection() {
        // Update score circle
        const scorePercentage = document.getElementById('scorePercentage');
        const scoreLabel = document.getElementById('scoreLabel');
        
        if (scorePercentage) {
            const scoreClass = this.examResults.passed ? 'pass' : 'fail';
            scorePercentage.className = `score-percentage ${scoreClass}`;
            scorePercentage.textContent = `${this.examResults.score}%`;
        }
        
        if (scoreLabel) {
            scoreLabel.textContent = `Your Score`;
        }
        
        // Update score details
        const correctCount = document.getElementById('correctCount');
        const incorrectCount = document.getElementById('incorrectCount');
        const totalCount = document.getElementById('totalCount');
        
        if (correctCount) {
            correctCount.textContent = this.examResults.correctAnswers;
        }
        
        if (incorrectCount) {
            incorrectCount.textContent = this.examResults.incorrectAnswers;
        }
        
        if (totalCount) {
            totalCount.textContent = this.examResults.totalQuestions;
        }
        
        // Create score circle animation
        this.animateScoreCircle();
    }

    animateScoreCircle() {
        const scoreCircle = document.getElementById('scoreCircle');
        if (!scoreCircle) return;
        
        const percentage = this.examResults.score;
        const color = this.examResults.passed ? '#2ed573' : '#ff6b6b';
        
        // Create SVG circle
        scoreCircle.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 200 200">
                <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="#e9ecef" 
                    stroke-width="8"
                />
                <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="${color}" 
                    stroke-width="8" 
                    stroke-dasharray="${2 * Math.PI * 90}" 
                    stroke-dashoffset="${2 * Math.PI * 90 * (1 - percentage / 100)}"
                    stroke-linecap="round"
                    transform="rotate(-90 100 100)"
                    style="transition: stroke-dashoffset 2s ease-in-out;"
                />
            </svg>
        `;
    }

    displaySummarySection() {
        const timeTaken = this.formatTime(this.examResults.examDuration);
        const accuracy = this.examResults.totalQuestions > 0 ? 
            Math.round((this.examResults.correctAnswers / this.examResults.totalQuestions) * 100) : 0;
        
        // Update summary cards
        const summaryData = [
            { id: 'timeTaken', value: timeTaken, icon: 'fa-clock' },
            { id: 'accuracy', value: `${accuracy}%`, icon: 'fa-bullseye' },
            { id: 'attempts', value: this.examResults.totalQuestions, icon: 'fa-list-ol' },
            { id: 'status', value: this.examResults.passed ? 'PASSED' : 'FAILED', icon: this.examResults.passed ? 'fa-check-circle' : 'fa-times-circle' }
        ];
        
        summaryData.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.innerHTML = `
                    <i class="fas ${item.icon}"></i>
                    <h4>${item.value}</h4>
                    <p>${this.getSummaryLabel(item.id)}</p>
                `;
            }
        });
    }

    getSummaryLabel(id) {
        const labels = {
            timeTaken: 'Time Taken',
            accuracy: 'Accuracy',
            attempts: 'Total Questions',
            status: 'Result Status'
        };
        return labels[id] || '';
    }

    displayAnalysisSection() {
        // Update performance stats
        const performanceStats = document.getElementById('performanceStats');
        if (performanceStats) {
            const stats = [
                { label: 'Total Questions', value: this.examResults.totalQuestions },
                { label: 'Correct Answers', value: this.examResults.correctAnswers },
                { label: 'Incorrect Answers', value: this.examResults.incorrectAnswers },
                { label: 'Unanswered', value: this.examResults.unansweredQuestions },
                { label: 'Score Percentage', value: `${this.examResults.score}%` },
                { label: 'Pass Status', value: this.examResults.passed ? 'PASSED' : 'FAILED' }
            ];
            
            performanceStats.innerHTML = stats.map(stat => `
                <div class="stat-row">
                    <span class="stat-label">${stat.label}</span>
                    <span class="stat-value">${stat.value}</span>
                </div>
            `).join('');
        }
        
        // Create performance chart
        this.createPerformanceChart();
    }

    createPerformanceChart() {
        const chartContainer = document.getElementById('performanceChart');
        if (!chartContainer) return;
        
        const data = [
            { label: 'Correct', value: this.examResults.correctAnswers, color: '#2ed573' },
            { label: 'Incorrect', value: this.examResults.incorrectAnswers, color: '#ff6b6b' },
            { label: 'Unanswered', value: this.examResults.unansweredQuestions, color: '#ffa502' }
        ];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (total === 0) {
            chartContainer.innerHTML = '<p>No data to display</p>';
            return;
        }
        
        let cumulativePercentage = 0;
        const segments = data.map(item => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            cumulativePercentage += percentage;
            
            return {
                ...item,
                percentage: Math.round(percentage),
                startAngle,
                endAngle
            };
        }).filter(item => item.value > 0);
        
        chartContainer.innerHTML = `
            <div class="chart-wrapper">
                <div class="pie-chart">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        ${segments.map(segment => this.createPieSlice(segment, 100, 100, 80)).join('')}
                    </svg>
                </div>
                <div class="chart-legend">
                    ${segments.map(segment => `
                        <div class="legend-item">
                            <div class="legend-color" style="background-color: ${segment.color}"></div>
                            <span>${segment.label}: ${segment.value} (${segment.percentage}%)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createPieSlice(segment, centerX, centerY, radius) {
        const startAngle = (segment.startAngle - 90) * (Math.PI / 180);
        const endAngle = (segment.endAngle - 90) * (Math.PI / 180);
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
        
        return `
            <path 
                d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
                fill="${segment.color}"
                stroke="white"
                stroke-width="2"
            />
        `;
    }

    displayQuestionReview() {
        const reviewContainer = document.getElementById('questionsReview');
        if (!reviewContainer) return;
        
        this.updateQuestionReview();
    }

    updateQuestionReview() {
        const reviewContainer = document.getElementById('questionsReview');
        if (!reviewContainer) return;
        
        let questionsToShow = this.examResults.questionResults;
        
        // Filter questions based on selection
        if (this.showingAnswers === 'correct') {
            questionsToShow = questionsToShow.filter(q => q.isCorrect);
        } else if (this.showingAnswers === 'incorrect') {
            questionsToShow = questionsToShow.filter(q => q.isAnswered && !q.isCorrect);
        } else if (this.showingAnswers === 'unanswered') {
            questionsToShow = questionsToShow.filter(q => !q.isAnswered);
        }
        
        if (questionsToShow.length === 0) {
            reviewContainer.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>No questions to show</h3>
                    <p>No questions match the selected filter.</p>
                </div>
            `;
            return;
        }
        
        reviewContainer.innerHTML = questionsToShow.map((question, index) => {
            const questionNumber = this.examResults.questionResults.indexOf(question) + 1;
            const statusClass = question.isAnswered ? (question.isCorrect ? 'correct' : 'incorrect') : 'unanswered';
            const statusText = question.isAnswered ? (question.isCorrect ? 'Correct' : 'Incorrect') : 'Unanswered';
            
            return `
                <div class="review-question ${statusClass}">
                    <div class="review-question-header">
                        <span class="review-question-number">Question ${questionNumber}</span>
                        <span class="review-question-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="review-question-text">${question.question}</div>
                    <div class="review-options">
                        ${question.options.map((option, optionIndex) => {
                            let optionClass = 'neutral';
                            if (optionIndex === question.correctAnswer) {
                                optionClass = 'correct';
                            } else if (optionIndex === question.userAnswer && question.userAnswer !== question.correctAnswer) {
                                optionClass = 'incorrect';
                            }
                            
                            const isUserAnswer = optionIndex === question.userAnswer;
                            const isCorrectAnswer = optionIndex === question.correctAnswer;
                            
                            return `
                                <div class="review-option ${optionClass}">
                                    <span class="review-option-letter">${String.fromCharCode(65 + optionIndex)}</span>
                                    ${option}
                                    ${isUserAnswer ? ' <i class="fas fa-arrow-left" title="Your answer"></i>' : ''}
                                    ${isCorrectAnswer ? ' <i class="fas fa-check" title="Correct answer"></i>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${question.explanation ? `
                        <div class="question-explanation">
                            <strong>Explanation:</strong> ${question.explanation}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    initializeCharts() {
        // Initialize any additional charts if needed
        setTimeout(() => {
            this.animateScoreCircle();
        }, 500);
    }

    bindEventListeners() {
        // Filter buttons for question review
        const filterButtons = document.querySelectorAll('.review-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update filter
                this.showingAnswers = e.target.dataset.filter;
                this.updateQuestionReview();
            });
        });
        
        // Result actions
        const retakeBtn = document.getElementById('retakeExamBtn');
        const homeBtn = document.getElementById('backHomeBtn');
        const certificateBtn = document.getElementById('generateCertificateBtn');
        const shareBtn = document.getElementById('shareResultBtn');
        
        if (retakeBtn) {
            retakeBtn.addEventListener('click', async () => {
                const result = await Swal.fire({
                    title: 'Retake Exam?',
                    text: 'Are you sure you want to retake the exam? This will start a new exam session.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Retake',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#667eea'
                });

                if (result.isConfirmed) {
                    window.location.href = 'exam.html';
                }
            });
        }
        
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Question Summary button
        const questionSummaryBtn = document.getElementById('questionSummaryBtn');
        if (questionSummaryBtn) {
            questionSummaryBtn.addEventListener('click', () => {
                this.showQuestionSummary();
            });
        }
        
        if (certificateBtn) {
            certificateBtn.addEventListener('click', () => {
                if (this.examResults.passed) {
                    this.generateCertificate();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Certificate Not Available',
                        text: 'Certificate is only available for passed exams. You need to score at least 60% to get a certificate.',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResults());
        }

        // Header authentication buttons
        const headerLoginBtn = document.getElementById('loginBtn');
        const headerLogoutBtn = document.getElementById('logoutBtn');
        
        if (headerLoginBtn) {
            headerLoginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }

        if (headerLogoutBtn) {
            headerLogoutBtn.addEventListener('click', async () => {
                const result = await Swal.fire({
                    title: 'Logout Confirmation',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Logout',
                    cancelButtonText: 'Cancel'
                });

                if (result.isConfirmed) {
                    try {
                        await AuthManager.logout();
                        Swal.fire({
                            icon: 'success',
                            title: 'Logged Out',
                            text: 'You have been successfully logged out.',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    } catch (error) {
                        console.error('Logout error:', error);
                        // Force logout
                        localStorage.clear();
                        window.location.href = 'index.html';
                    }
                }
            });
        }
    }

    generateCertificate() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="certificate-modal">
                <div class="certificate" id="certificate">
                    <div class="certificate-header">
                        <div class="certificate-logo">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Dct24.com</span>
                        </div>
                        <h2>Certificate of Achievement</h2>
                    </div>
                    
                    <div class="certificate-body">
                        <h3>This is to certify that</h3>
                        <div class="student-name">${this.examResults.studentName}</div>
                        <h3>has successfully completed</h3>
                        <div class="course-name">Online Assessment Test</div>
                        
                        <div class="certificate-details">
                            <p><strong>Score:</strong> ${this.examResults.score}%</p>
                            <p><strong>Date:</strong> ${new Date(this.examResults.submittedAt).toLocaleDateString()}</p>
                            <p><strong>Questions:</strong> ${this.examResults.correctAnswers}/${this.examResults.totalQuestions} Correct</p>
                        </div>
                    </div>
                    
                    <div class="certificate-footer">
                        <div class="signature">
                            <p>Digital Signature</p>
                        </div>
                        <div class="certificate-id">
                            <p>Certificate ID: ${this.generateCertificateId()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="downloadCertificate">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-secondary" id="closeCertificate">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners for modal
        const downloadBtn = document.getElementById('downloadCertificate');
        const closeBtn = document.getElementById('closeCertificate');
        
        downloadBtn.addEventListener('click', () => this.downloadCertificate());
        closeBtn.addEventListener('click', () => modal.remove());
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateCertificateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `GURU24-${timestamp}-${random}`.toUpperCase();
    }

    downloadCertificate() {
        // This would typically use a library like html2canvas or jsPDF
        // For now, we'll show a message
        Swal.fire({
            icon: 'success',
            title: 'Certificate Generated!',
            text: 'Certificate download feature will be implemented with a PDF generation library. Your certificate has been generated successfully!',
            confirmButtonText: 'Got it!'
        });
    }

    shareResults() {
                    const shareText = `I just completed an exam on Dct24.com and scored ${this.examResults.score}%! ${this.examResults.passed ? '🎉 I passed!' : '📚 Time to study more!'}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Exam Results - Dct24.com',
                text: shareText,
                url: window.location.origin
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(shareText + ` Check it out at ${window.location.origin}`).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied to Clipboard!',
                    text: 'Results copied to clipboard! You can now paste and share.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Copy Failed',
                    text: 'Unable to copy to clipboard. You can manually share your results!',
                    confirmButtonText: 'OK'
                });
            });
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.location.href='index.html'" class="btn btn-primary">Go Back to Home</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    // Show Question Summary Modal
    showQuestionSummary() {
        console.log('📋 Showing Question Summary...');
        
        const modal = document.getElementById('questionSummaryModal');
        const container = document.getElementById('questionsSummaryContainer');
        
        if (!modal || !container) {
            console.error('❌ Question Summary modal elements not found');
            return;
        }

        // Initialize with all questions
        this.currentFilter = 'all';
        this.renderQuestionSummary();
        
        // Setup filter event listeners
        this.setupSummaryFilters();
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Question Summary modal opened');
    }

    // Setup Summary Filter Buttons
    setupSummaryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update filter and re-render
                this.currentFilter = e.target.dataset.filter;
                this.renderQuestionSummary();
            });
        });
    }

    // Render Question Summary based on filter
    renderQuestionSummary() {
        const container = document.getElementById('questionsSummaryContainer');
        if (!container || !this.examResults || !this.examResults.questionResults) {
            return;
        }

        let questionsToShow = this.examResults.questionResults;
        
        // Apply filter
        switch(this.currentFilter) {
            case 'correct':
                questionsToShow = questionsToShow.filter(q => q.isCorrect);
                break;
            case 'incorrect':
                questionsToShow = questionsToShow.filter(q => q.isAnswered && !q.isCorrect);
                break;
            case 'unanswered':
                questionsToShow = questionsToShow.filter(q => !q.isAnswered);
                break;
            default:
                // Show all questions
                break;
        }

        if (questionsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-questions-message">
                    <i class="fas fa-info-circle"></i>
                    <h3>No Questions Found</h3>
                    <p>No questions match the selected filter.</p>
                </div>
            `;
            return;
        }

        // Generate HTML for questions
        container.innerHTML = questionsToShow.map((question, index) => {
            const originalIndex = this.examResults.questionResults.indexOf(question);
            const questionNumber = originalIndex + 1;
            
            let statusClass, statusText, statusIcon;
            if (question.isAnswered) {
                if (question.isCorrect) {
                    statusClass = 'correct';
                    statusText = 'Correct';
                    statusIcon = 'fas fa-check-circle';
                } else {
                    statusClass = 'incorrect';
                    statusText = 'Incorrect';
                    statusIcon = 'fas fa-times-circle';
                }
            } else {
                statusClass = 'unanswered';
                statusText = 'Unanswered';
                statusIcon = 'fas fa-question-circle';
            }

            return `
                <div class="summary-question ${statusClass}">
                    <div class="summary-question-header">
                        <span class="summary-question-number">Question ${questionNumber}</span>
                        <span class="summary-question-status">
                            <i class="${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    <div class="summary-question-text">${question.question}</div>
                    <div class="summary-options">
                        ${question.options.map((option, optIndex) => {
                            let optionClass = '';
                            let indicator = '';
                            
                            if (optIndex === question.correctAnswer) {
                                optionClass = 'correct';
                                indicator = '<i class="fas fa-check"></i>';
                            } else if (optIndex === question.userAnswer && optIndex !== question.correctAnswer) {
                                optionClass = 'incorrect';
                                indicator = '<i class="fas fa-times"></i>';
                            } else if (optIndex === question.userAnswer) {
                                optionClass = 'selected';
                            }
                            
                            return `
                                <div class="summary-option ${optionClass}">
                                    <div class="summary-option-label">${String.fromCharCode(65 + optIndex)}</div>
                                    <div class="summary-option-text">${option}</div>
                                    <div class="summary-option-indicator">${indicator}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Update footer statistics
        this.updateSummaryStats();
    }

    // Update Summary Statistics in Footer
    updateSummaryStats() {
        const footerStatsContainer = document.querySelector('.question-summary-modal .modal-footer .summary-stats');
        if (!footerStatsContainer) {
            // Create stats if doesn't exist
            const footer = document.querySelector('.question-summary-modal .modal-footer');
            if (footer) {
                const statsDiv = document.createElement('div');
                statsDiv.className = 'summary-stats';
                footer.insertBefore(statsDiv, footer.firstChild);
            }
        }

        const statsContainer = document.querySelector('.question-summary-modal .modal-footer .summary-stats');
        if (statsContainer && this.examResults) {
            const totalQuestions = this.examResults.totalQuestions;
            const correctAnswers = this.examResults.correctAnswers;
            const incorrectAnswers = this.examResults.incorrectAnswers;
            const unansweredQuestions = this.examResults.unansweredQuestions;

            statsContainer.innerHTML = `
                <div class="summary-stat correct">
                    <i class="fas fa-check-circle"></i>
                    <span>${correctAnswers} Correct</span>
                </div>
                <div class="summary-stat incorrect">
                    <i class="fas fa-times-circle"></i>
                    <span>${incorrectAnswers} Incorrect</span>
                </div>
                
                <div class="summary-stat">
                    <i class="fas fa-list"></i>
                    <span>${totalQuestions} Total</span>
                </div>
            `;
        }
    }
}

// Global function to close summary modal
function closeSummaryModal() {
    const modal = document.getElementById('questionSummaryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize results when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the result page
    if (document.getElementById('resultContainer')) {
        window.resultManager = new ResultManager();
    }
});

// Add styles for question explanations and charts
const style = document.createElement('style');
style.textContent = `
    .question-explanation {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .chart-wrapper {
        display: flex;
        align-items: center;
        gap: 2rem;
        justify-content: center;
    }
    
    .pie-chart {
        flex-shrink: 0;
    }
    
    .chart-legend {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }
    
    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
    }
    
    .review-filter-btn {
        padding: 0.5rem 1rem;
        border: 2px solid #667eea;
        background: transparent;
        color: #667eea;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .review-filter-btn:hover,
    .review-filter-btn.active {
        background: #667eea;
        color: white;
    }
    
    @media (max-width: 768px) {
        .chart-wrapper {
            flex-direction: column;
            gap: 1rem;
        }
    }
`;
document.head.appendChild(style); 