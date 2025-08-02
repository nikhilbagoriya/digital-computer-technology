import { database, DEMO_MODE } from './firebase-config.js';

// Only import Firebase functions if not in demo mode
let ref, push, set, get, remove, onValue, off;
let shouldUseDemoMode = false;

// Wait for firebase config to initialize properly
if (typeof DEMO_MODE === 'undefined') {
    shouldUseDemoMode = false; // Default to trying Firebase first
}

if (!shouldUseDemoMode) {
    try {
        const dbModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        ref = dbModule.ref;
        push = dbModule.push;
        set = dbModule.set;
        get = dbModule.get;
        remove = dbModule.remove;
        onValue = dbModule.onValue;
        off = dbModule.off;
        
        // Test if Firebase database is available
        if (!database || database.demo) {
            console.warn('Firebase database not available, switching to demo mode');
            shouldUseDemoMode = true;
        }
    } catch (error) {
        console.warn('Failed to load Firebase modules, switching to demo mode:', error);
        shouldUseDemoMode = true;
    }
}

console.log('📚 Questions Manager - Demo Mode:', shouldUseDemoMode);

class QuestionsManager {
    constructor() {
        this.questions = [];
        this.listeners = [];
    }

    // Switch to demo mode if Firebase fails
    switchToDemoMode() {
        if (!shouldUseDemoMode) {
            console.log('🎯 Questions Manager switching to Demo Mode');
            shouldUseDemoMode = true;
        }
    }

    // Add some default demo questions if none exist
    addDefaultDemoQuestions() {
        const defaultQuestions = [
            {
                question: "What is the full form of CCC?",
                options: ["Computer Course Certificate", "Course on Computer Concepts", "Certificate in Computer Course", "Computer Concepts Course"],
                correctAnswer: 1,
                courseType: "ccc",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                question: "Which is the first page of a website?",
                options: ["Homepage", "Web page", "Main page", "Index page"],
                correctAnswer: 0,
                courseType: "ccc",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                question: "What does RS-CIT stand for?",
                options: ["Rajasthan State Certificate in Information Technology", "Royal State Computer IT", "Rajasthan System Computer IT", "None of the above"],
                correctAnswer: 0,
                courseType: "rscit",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                question: "Which software is used for word processing?",
                options: ["Excel", "PowerPoint", "MS Word", "Paint"],
                correctAnswer: 2,
                courseType: "rscit",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                question: "What is the shortcut key for copy?",
                options: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"],
                correctAnswer: 0,
                courseType: "free-test",
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];

        defaultQuestions.forEach((question, index) => {
            const coursePrefix = question.courseType || 'general';
            const id = 'default_' + (index + 1);
            const storageKey = 'demo_questions/' + coursePrefix + '/' + id;
            localStorage.setItem(storageKey, JSON.stringify(question));
        });

        console.log('✅ Added', defaultQuestions.length, 'default demo questions');
    }

    // Get all questions
    async getAllQuestions() {
        try {
            console.log('📚 Getting all questions, Demo Mode:', shouldUseDemoMode);
            
            if (shouldUseDemoMode) {
                // Demo mode: get from localStorage (all courses)
                const questions = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('demo_questions/')) {
                        try {
                            const questionData = JSON.parse(localStorage.getItem(key));
                            const idParts = key.replace('demo_questions/', '').split('/');
                            const id = idParts.length > 1 ? idParts[1] : idParts[0];
                            questions.push({ id, ...questionData });
                        } catch (e) {
                            console.warn('Invalid question data for key:', key);
                        }
                    }
                }

                // If no questions found, add default ones
                if (questions.length === 0) {
                    console.log('📚 No demo questions found, adding defaults...');
                    this.addDefaultDemoQuestions();
                    return this.getAllQuestions(); // Recursive call to get the newly added questions
                }

                this.questions = questions;
                console.log('✅ Demo questions loaded:', questions.length);
            } else {
                try {
                    if (!ref || !database) {
                        throw new Error('Firebase database not available');
                    }
                    
                    // Get questions from all course collections
                    const questionsRef = ref(database, 'questions');
                    const snapshot = await get(questionsRef);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        this.questions = [];
                        
                        // Iterate through course collections
                        Object.keys(data).forEach(courseType => {
                            const courseQuestions = data[courseType];
                            if (courseQuestions && typeof courseQuestions === 'object') {
                                Object.keys(courseQuestions).forEach(questionId => {
                                    this.questions.push({
                                        id: questionId,
                                        courseType: courseType,
                                        ...courseQuestions[questionId]
                                    });
                                });
                            }
                        });
                        
                        console.log('✅ Firebase questions loaded from all courses:', this.questions.length);
                    } else {
                        this.questions = [];
                        console.log('📚 No Firebase questions found');
                    }
                } catch (firebaseError) {
                    console.warn('Firebase failed, switching to demo mode:', firebaseError.message);
                    this.switchToDemoMode();
                    return this.getAllQuestions(); // Retry with demo mode
                }
            }
            
            return { success: true, questions: this.questions };
        } catch (error) {
            console.error('Error fetching questions:', error);
            return { success: false, error: error.message };
        }
    }

    // Add a new question
    async addQuestion(questionData) {
        try {
            const question = {
                question: questionData.question.trim(),
                options: questionData.options.map(opt => opt.trim()),
                correctAnswer: parseInt(questionData.correctAnswer),
                courseType: questionData.courseType || 'general',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            console.log('💾 Adding question:', {
                courseType: question.courseType,
                questionPreview: question.question.substring(0, 50) + '...'
            });
            
            if (shouldUseDemoMode) {
                // Demo mode: save to localStorage with course prefix
                const coursePrefix = question.courseType || 'general';
                const id = coursePrefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const storageKey = 'demo_questions/' + coursePrefix + '/' + id;
                localStorage.setItem(storageKey, JSON.stringify(question));
                console.log('✅ Demo question added to course:', coursePrefix, 'ID:', id);
                return { success: true, id: id };
            } else {
                try {
                    if (!ref || !database) {
                        throw new Error('Firebase database not available');
                    }
                    
                    // Save to course-specific collection in Firebase
                    const courseType = question.courseType || 'general';
                    const questionsRef = ref(database, `questions/${courseType}`);
                    const newQuestionRef = push(questionsRef);
                    await set(newQuestionRef, question);
                    console.log('✅ Firebase question added to course:', courseType, 'ID:', newQuestionRef.key);
                    return { success: true, id: newQuestionRef.key };
                } catch (firebaseError) {
                    console.warn('Firebase failed, switching to demo mode:', firebaseError.message);
                    this.switchToDemoMode();
                    return this.addQuestion(questionData); // Retry with demo mode
                }
            }
        } catch (error) {
            console.error('Error adding question:', error);
            return { success: false, error: error.message };
        }
    }

    // Update a question
    async updateQuestion(questionId, questionData) {
        try {
            const question = {
                question: questionData.question.trim(),
                options: questionData.options.map(opt => opt.trim()),
                correctAnswer: parseInt(questionData.correctAnswer),
                courseType: questionData.courseType || 'general',
                updatedAt: Date.now()
            };

            console.log('📝 Updating question:', {
                id: questionId,
                courseType: question.courseType
            });

            if (shouldUseDemoMode) {
                // Demo mode: find and update in localStorage
                let found = false;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('demo_questions/') && key.includes(questionId)) {
                        const existingData = JSON.parse(localStorage.getItem(key));
                        const updatedData = { ...existingData, ...question };
                        
                        // Remove old entry
                        localStorage.removeItem(key);
                        
                        // Add new entry with updated course path
                        const coursePrefix = question.courseType || 'general';
                        const newKey = 'demo_questions/' + coursePrefix + '/' + questionId;
                        localStorage.setItem(newKey, JSON.stringify(updatedData));
                        
                        console.log('✅ Demo question updated:', questionId, 'in course:', coursePrefix);
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    return { success: false, error: 'Question not found' };
                }
                return { success: true };
            } else {
                try {
                    if (!ref || !database) {
                        throw new Error('Firebase database not available');
                    }
                    
                    // First, find the question in its current course location
                    const currentQuestion = await this.getQuestion(questionId);
                    if (!currentQuestion.success) {
                        return { success: false, error: 'Question not found' };
                    }
                    
                    const oldCourseType = currentQuestion.question.courseType || 'general';
                    const newCourseType = question.courseType || 'general';
                    
                    // If course type changed, we need to move the question
                    if (oldCourseType !== newCourseType) {
                        // Delete from old location
                        const oldRef = ref(database, `questions/${oldCourseType}/${questionId}`);
                        await remove(oldRef);
                        
                        // Add to new location
                        const newRef = ref(database, `questions/${newCourseType}/${questionId}`);
                        await set(newRef, question);
                        
                        console.log('✅ Firebase question moved:', questionId, 'from', oldCourseType, 'to', newCourseType);
                    } else {
                        // Update in same location
                        const questionRef = ref(database, `questions/${newCourseType}/${questionId}`);
                        await set(questionRef, question);
                        
                        console.log('✅ Firebase question updated:', questionId, 'in course:', newCourseType);
                    }
                    
                    return { success: true };
                } catch (firebaseError) {
                    console.warn('Firebase failed, switching to demo mode:', firebaseError.message);
                    this.switchToDemoMode();
                    return this.updateQuestion(questionId, questionData); // Retry with demo mode
                }
            }
        } catch (error) {
            console.error('Error updating question:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a question
    async deleteQuestion(questionId) {
        try {
            console.log('🗑️ Deleting question:', questionId);
            
            if (shouldUseDemoMode) {
                // Demo mode: find and remove from localStorage
                let found = false;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('demo_questions/') && key.includes(questionId)) {
                        localStorage.removeItem(key);
                        console.log('✅ Demo question deleted:', questionId);
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    return { success: false, error: 'Question not found' };
                }
                return { success: true };
            } else {
                try {
                    if (!ref || !database) {
                        throw new Error('Firebase database not available');
                    }
                    
                    // First, find the question to get its course type
                    const currentQuestion = await this.getQuestion(questionId);
                    if (!currentQuestion.success) {
                        return { success: false, error: 'Question not found' };
                    }
                    
                    const courseType = currentQuestion.question.courseType || 'general';
                    const questionRef = ref(database, `questions/${courseType}/${questionId}`);
                    await remove(questionRef);
                    console.log('✅ Firebase question deleted:', questionId, 'from course:', courseType);
                    return { success: true };
                } catch (firebaseError) {
                    console.warn('Firebase failed, switching to demo mode:', firebaseError.message);
                    this.switchToDemoMode();
                    return this.deleteQuestion(questionId); // Retry with demo mode
                }
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            return { success: false, error: error.message };
        }
    }

    // Get a specific question
    async getQuestion(questionId) {
        try {
            if (shouldUseDemoMode) {
                // Demo mode: find in localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('demo_questions/') && key.includes(questionId)) {
                        const data = localStorage.getItem(key);
                        if (data) {
                            return { success: true, question: { id: questionId, ...JSON.parse(data) } };
                        }
                    }
                }
                return { success: false, error: 'Question not found' };
            } else {
                try {
                    if (!ref || !database) {
                        throw new Error('Firebase database not available');
                    }
                    
                    // Search through all course collections
                    const questionsRef = ref(database, 'questions');
                    const snapshot = await get(questionsRef);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        
                        // Search through each course
                        for (const courseType of Object.keys(data)) {
                            const courseQuestions = data[courseType];
                            if (courseQuestions && courseQuestions[questionId]) {
                                return {
                                    success: true,
                                    question: {
                                        id: questionId,
                                        courseType: courseType,
                                        ...courseQuestions[questionId]
                                    }
                                };
                            }
                        }
                    }
                    
                    return { success: false, error: 'Question not found' };
                } catch (firebaseError) {
                    console.warn('Firebase failed, switching to demo mode:', firebaseError.message);
                    this.switchToDemoMode();
                    return this.getQuestion(questionId); // Retry with demo mode
                }
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            return { success: false, error: error.message };
        }
    }

    // Listen for questions changes (real-time updates)
    listenForQuestions(callback) {
        if (shouldUseDemoMode) {
            // Demo mode: periodic check for localStorage changes
            const checkForChanges = () => {
                this.getAllQuestions().then(result => {
                    if (result.success) {
                        callback(result.questions);
                    }
                });
            };
            
            // Check every 2 seconds for demo mode
            const intervalId = setInterval(checkForChanges, 2000);
            this.listeners.push(() => clearInterval(intervalId));
            
            // Initial call
            checkForChanges();
        } else {
            const questionsRef = ref(database, 'questions');
            const listener = onValue(questionsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const questions = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    callback(questions);
                } else {
                    callback([]);
                }
            });
            
            this.listeners.push(() => off(questionsRef, 'value', listener));
        }
    }

    // Stop all listeners
    stopListening() {
        this.listeners.forEach(stopFn => stopFn());
        this.listeners = [];
    }

    // Validate question data
    validateQuestion(questionData) {
        const errors = [];

        if (!questionData.question || questionData.question.trim().length === 0) {
            errors.push('Question text is required');
        }

        if (!questionData.options || questionData.options.length !== 4) {
            errors.push('Exactly 4 options are required');
        } else {
            questionData.options.forEach((option, index) => {
                if (!option || option.trim().length === 0) {
                    errors.push(`Option ${index + 1} cannot be empty`);
                }
            });
        }

        if (questionData.correctAnswer === undefined || 
            questionData.correctAnswer < 0 || 
            questionData.correctAnswer > 3) {
            errors.push('Valid correct answer (0-3) is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Get random questions for quiz
    getRandomQuestions(count = 10) {
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Search questions
    searchQuestions(searchTerm) {
        if (!searchTerm) return this.questions;
        
        const term = searchTerm.toLowerCase();
        return this.questions.filter(q => 
            q.question.toLowerCase().includes(term) ||
            q.options.some(opt => opt.toLowerCase().includes(term))
        );
    }

    // Filter questions by course type
    getQuestionsByCourse(courseType) {
        if (!courseType || courseType === 'all') {
            return this.questions;
        }
        
        return this.questions.filter(q => q.courseType === courseType);
    }

    // Get random questions by course type
    getRandomQuestionsByCourse(courseType, count = 10) {
        const courseQuestions = this.getQuestionsByCourse(courseType);
        const shuffled = [...courseQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Get question statistics
    getStatistics() {
        return {
            total: this.questions.length,
            byDate: this.groupByDate(),
            demoMode: shouldUseDemoMode
        };
    }

    // Group questions by creation date
    groupByDate() {
        const groups = {};
        this.questions.forEach(q => {
            const date = new Date(q.createdAt).toDateString();
            groups[date] = (groups[date] || 0) + 1;
        });
        return groups;
    }
}

// Create and export a singleton instance
const questionsManager = new QuestionsManager();

// Expose a limited API
export default {
    getAllQuestions: questionsManager.getAllQuestions.bind(questionsManager),
    addQuestion: questionsManager.addQuestion.bind(questionsManager),
    updateQuestion: questionsManager.updateQuestion.bind(questionsManager),
    deleteQuestion: questionsManager.deleteQuestion.bind(questionsManager),
    getQuestion: questionsManager.getQuestion.bind(questionsManager),
    getStatistics: questionsManager.getStatistics.bind(questionsManager),
    validateQuestion: questionsManager.validateQuestion.bind(questionsManager),
    getDb: () => database,
    getRef: (db, path) => ref(db, path),
    get: (ref) => get(ref)
}; 