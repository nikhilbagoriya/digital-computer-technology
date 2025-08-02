import authManager from './auth.js';
import questionsManager from './questions.js';

class AdminApp {
    constructor() {
        this.currentEditingId = null;
        this.init();
    }

    async init() {
        // Check if user is admin
        if (!authManager.requireAdmin()) {
            return;
        }

        // Update header authentication UI
        this.updateHeaderAuth();

        this.setupEventListeners();
        await this.loadQuestions();
    }

    updateHeaderAuth() {
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const currentUser = authManager.getCurrentUser();
        const isAdmin = authManager.isAdmin();
        
        if (currentUser && isAdmin) {
            // Admin is logged in
            if (userInfo) {
                userInfo.textContent = `Admin: ${currentUser.email}`;
            }
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
        } else {
            // Not logged in or not admin
            if (userInfo) {
                userInfo.textContent = 'Access Denied';
            }
            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('✅ Admin logout button found');
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🔗 Admin logout button clicked');
                
                const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you want to logout from admin panel?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, logout',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#d33'
                });

                if (result.isConfirmed) {
                    console.log('🔄 Admin confirmed logout');
                    
                    // Show loading
                    Swal.fire({
                        title: 'Logging out...',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    
                    try {
                        const logoutResult = await authManager.logout();
                        console.log('🔄 Admin logout result:', logoutResult);
                        
                        if (logoutResult.success) {
                            console.log('✅ Admin logout successful');
                            
                            await Swal.fire({
                                icon: 'success',
                                title: 'Logged Out',
                                text: 'Admin session ended successfully. Page will refresh.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            
                            // Refresh page to clear admin state
                            console.log('🔄 Refreshing page to clear admin state...');
                            window.location.reload();
                            
                        } else {
                            console.error('❌ Admin logout failed:', logoutResult.error);
                            
                            await Swal.fire({
                                icon: 'error',
                                title: 'Logout Failed',
                                text: logoutResult.error || 'An error occurred during logout',
                                footer: 'You can try refreshing the page or clearing browser data'
                            });
                            
                            // Force logout anyway and refresh
                            console.log('🔄 Force admin logout and refresh...');
                            localStorage.clear();
                            window.location.reload();
                        }
                    } catch (error) {
                        console.error('❌ Admin logout error:', error);
                        
                        await Swal.fire({
                            icon: 'error',
                            title: 'Logout Error',
                            text: 'An unexpected error occurred. Page will refresh to clear state.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        
                        // Force logout and refresh
                        localStorage.clear();
                        window.location.reload();
                    }
                } else {
                    console.log('❌ Admin logout cancelled by user');
                }
            });
        } else {
            console.warn('❌ Admin logout button not found');
        }

        // Login button (for header) - Hide in admin panel
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'none'; // Hide login button in admin panel
        }

        // Add question button
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => {
                this.openQuestionModal();
            });
        }

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const questionModal = document.getElementById('questionModal');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeQuestionModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeQuestionModal();
            });
        }

        // Close modal when clicking outside
        if (questionModal) {
            questionModal.addEventListener('click', (e) => {
                if (e.target === questionModal) {
                    this.closeQuestionModal();
                }
            });
        }

        // Question form submission
        const questionForm = document.getElementById('questionForm');
        if (questionForm) {
            questionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuestionSubmit();
            });
        }
        
        // Course filter
        const courseFilter = document.getElementById('courseSelect');
        if(courseFilter) {
            courseFilter.addEventListener('change', () => {
                this.filterQuestionsByCourse(courseFilter.value);
            });
        }

        // View switching
        const dashboardLink = document.getElementById('dashboard-link');
        const usersLink = document.getElementById('users-link');
        if (dashboardLink && usersLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('dashboard');
            });
            usersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('users');
            });
        }
    }

    async loadQuestions() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const questionsTable = document.getElementById('questionsTable');

        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (questionsTable) questionsTable.style.display = 'none';

        try {
            const result = await questionsManager.getAllQuestions();
            
            if (result.success) {
                this.allQuestions = result.questions; // Store all questions
                this.displayQuestions(this.allQuestions);
                this.updateQuestionCount(this.allQuestions.length);
            } else {
                this.showError('Failed to load questions: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError('Failed to load questions. Please try again later.');
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (questionsTable) questionsTable.style.display = 'block';
        }
    }

    displayQuestions(questions) {
        const tableBody = document.getElementById('questionsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = ''; // Clear existing rows

        if (questions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="no-questions">
                            <i class="fas fa-question-circle"></i>
                            <p>No questions found. Click "Add Question" to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Helper function to get course display name
        const getCourseDisplayName = (courseType) => {
            const courseNames = {
                'rscit': 'RS-CIT',
                'ccc': 'CCC',
                'rscit-subject': 'RS-CIT Subject',
                'ccc-subject': 'CCC Subject',
                'rscit-mock': 'RS-CIT Mock',
                'ccc-practical': 'CCC Practical',
                'free-test': 'Free Test'
            };
            return courseNames[courseType] || courseType || 'N/A';
        };

        questions.forEach((q, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td data-course-type="${q.courseType}">${getCourseDisplayName(q.courseType)}</td>
                <td class="question-col">${q.question}</td>
                <td class="options-col">${q.options.join('<br>')}</td>
                <td>${q.options[q.correctAnswer]}</td>
                <td class="actions-col">
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${q.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${q.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Re-attach event listeners for edit/delete buttons
        this.attachTableEventListeners();
    }

    attachTableEventListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            // Prevent adding multiple listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                const questionId = e.currentTarget.dataset.id;
                this.editQuestion(questionId);
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
             // Prevent adding multiple listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', (e) => {
                const questionId = e.currentTarget.dataset.id;
                this.deleteQuestion(questionId);
            });
        });
    }

    updateQuestionCount(count) {
        const totalQuestions = document.getElementById('totalQuestions');
        if (totalQuestions) {
            totalQuestions.textContent = count;
        }
    }

    openQuestionModal(questionData = null) {
        const modal = document.getElementById('questionModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('questionForm');

        if (questionData) {
            // Editing mode
            this.currentEditingId = questionData.id;
            modalTitle.textContent = 'Edit Question';
            this.populateForm(questionData);
        } else {
            // Adding mode
            this.currentEditingId = null;
            modalTitle.textContent = 'Add New Question';
            form.reset();
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    closeQuestionModal() {
        const modal = document.getElementById('questionModal');
        const form = document.getElementById('questionForm');
        
        modal.classList.remove('show');
        modal.style.display = 'none';
        form.reset();
        this.currentEditingId = null;
    }

    populateForm(questionData) {
        document.getElementById('courseType').value = questionData.courseType || '';
        document.getElementById('questionText').value = questionData.question;
        document.getElementById('option1').value = questionData.options[0];
        document.getElementById('option2').value = questionData.options[1];
        document.getElementById('option3').value = questionData.options[2];
        document.getElementById('option4').value = questionData.options[3];
        
        // Set correct answer radio button
        const correctRadio = document.querySelector(`input[name="correctAnswer"][value="${questionData.correctAnswer}"]`);
        if (correctRadio) {
            correctRadio.checked = true;
        }
    }

    async handleQuestionSubmit() {
        const submitBtn = document.querySelector('#questionForm button[type="submit"]');
        
        // Get form data
        const questionData = {
            courseType: document.getElementById('courseType').value,
            question: document.getElementById('questionText').value,
            options: [
                document.getElementById('option1').value,
                document.getElementById('option2').value,
                document.getElementById('option3').value,
                document.getElementById('option4').value
            ],
            correctAnswer: parseInt(document.querySelector('input[name="correctAnswer"]:checked')?.value)
        };

        console.log('📝 Form data collected:', questionData);

        // Validate data
        console.log('🔍 Validating question data...');
        const validation = questionsManager.validateQuestion(questionData);
        console.log('✅ Validation result:', validation);

        if (!validation.isValid) {
            console.warn('❌ Validation failed:', validation.errors);
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: validation.errors.map(error => `• ${error}`).join('<br>')
            });
            return;
        }

        // Show loading state
        this.setLoadingState(submitBtn, true);
        console.log('💾 Attempting to save question...');

        try {
            let result;
            if (this.currentEditingId) {
                // Update existing question
                console.log('📝 Updating existing question:', this.currentEditingId);
                result = await questionsManager.updateQuestion(this.currentEditingId, questionData);
            } else {
                // Add new question
                console.log('➕ Adding new question');
                result = await questionsManager.addQuestion(questionData);
            }

            console.log('✅ Save result:', result);

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: this.currentEditingId ? 'Question updated successfully!' : 'Question added successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });

                this.closeQuestionModal();
                await this.loadQuestions();
            } else {
                console.error('❌ Save failed:', result.error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error
                });
            }
        } catch (error) {
            console.error('❌ Error saving question:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async editQuestion(questionId) {
        try {
            const result = await questionsManager.getQuestion(questionId);
            
            if (result.success) {
                this.openQuestionModal(result.question);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load question data'
                });
            }
        } catch (error) {
            console.error('Error loading question for edit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        }
    }

    async deleteQuestion(questionId) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This question will be permanently deleted. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await questionsManager.deleteQuestion(questionId);
                
                if (deleteResult.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Question has been deleted successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    await this.loadQuestions();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: deleteResult.error
                    });
                }
            } catch (error) {
                console.error('Error deleting question:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred'
                });
            }
        }
    }

    setLoadingState(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const loadingIcon = button.querySelector('.loading-icon');

        if (isLoading) {
            button.disabled = true;
            if (loadingIcon) loadingIcon.style.display = 'inline-block';
            if (btnText) btnText.style.opacity = '0.7';
        } else {
            button.disabled = false;
            if (loadingIcon) loadingIcon.style.display = 'none';
            if (btnText) btnText.style.opacity = '1';
        }
    }

    showError(message) {
        const tableBody = document.getElementById('questionsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Error Loading Questions</h3>
                            <p>${message}</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-redo"></i> Try Again
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // Add some sample questions for demonstration
    async addSampleQuestions() {
        const result = await Swal.fire({
            title: 'Add Sample Questions?',
            text: 'This will add 5 sample questions to help you get started.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, add them',
            cancelButtonText: 'No, thanks'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Adding Sample Questions...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                const sampleResults = await questionsManager.addSampleQuestions();
                const successCount = sampleResults.filter(r => r.success).length;

                Swal.close();
                
                if (successCount > 0) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Sample Questions Added',
                        text: `${successCount} sample questions have been added successfully!`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                    await this.loadQuestions();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to add sample questions'
                    });
                }
            } catch (error) {
                console.error('Error adding sample questions:', error);
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred'
                });
            }
        }
    }

    // Add this new method to filter questions
    filterQuestionsByCourse(selectedCourse) {
        const filteredQuestions = selectedCourse === 'all'
            ? this.allQuestions
            : this.allQuestions.filter(q => q.courseType === selectedCourse);
        
        this.displayQuestions(filteredQuestions);
    }

    showView(viewName) {
        const dashboardView = document.querySelector('.admin-container:not(#users-section)');
        const usersView = document.getElementById('users-section');
        const dashboardLink = document.getElementById('dashboard-link');
        const usersLink = document.getElementById('users-link');

        if (viewName === 'users') {
            dashboardView.style.display = 'none';
            usersView.style.display = 'block';
            dashboardLink.classList.remove('active');
            usersLink.classList.add('active');
            this.loadUsers();
        } else { // 'dashboard'
            dashboardView.style.display = 'block';
            usersView.style.display = 'none';
            dashboardLink.classList.add('active');
            usersLink.classList.remove('active');
        }
    }

    async loadUsers() {
        const loadingSpinner = document.getElementById('usersLoadingSpinner');
        const usersTable = document.getElementById('usersTable');
        const tableBody = document.getElementById('usersTableBody');

        if (!tableBody) return;

        loadingSpinner.style.display = 'block';
        usersTable.style.display = 'none';
        tableBody.innerHTML = '';

        try {
            const usersRef = questionsManager.getRef(questionsManager.getDb(), 'users');
            const snapshot = await questionsManager.get(usersRef);

            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const users = Object.keys(usersData).map(uid => ({
                    uid,
                    ...usersData[uid]
                }));

                if (users.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
                } else {
                    users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.uid}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</td>
                            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">No users data found in the database.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading users:', error);
            tableBody.innerHTML = `<tr><td colspan="4">Error loading users: ${error.message}</td></tr>`;
        } finally {
            loadingSpinner.style.display = 'none';
            usersTable.style.display = 'block';
        }
    }
}

// Create global admin app instance
const adminApp = new AdminApp();

// Export for global access
window.adminApp = adminApp;

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add sample questions option if no questions exist
    setTimeout(async () => {
        const result = await questionsManager.getAllQuestions();
        if (result.success && result.questions.length === 0) {
            adminApp.addSampleQuestions();
        }
    }, 2000);
}); 