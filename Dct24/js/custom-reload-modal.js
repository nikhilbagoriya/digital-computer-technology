// Custom Reload Modal - Replace Browser Default Dialog
class CustomReloadModal {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔄 Custom Reload Modal DISABLED - No reload dialogs');
        
        // DISABLED - No custom reload behavior
        // this.setupBeforeUnloadHandler();
        // this.injectStyles();
        
        console.log('✅ Custom Reload Modal disabled for better UX');
    }

    setupBeforeUnloadHandler() {
        // Disable default browser dialog completely
        window.onbeforeunload = null;
        
        // Override browser's native alert/confirm functions
        this.overrideBrowserDialogs();
        
        // Handle keyboard shortcuts for reload
        window.addEventListener('keydown', (e) => {
            // Check for reload shortcuts
            const isReloadShortcut = (
                (e.ctrlKey && e.key.toLowerCase() === 'r') || 
                e.key === 'F5' || 
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') ||
                (e.ctrlKey && e.key === 'F5')
            );
            
            if (isReloadShortcut) {
                // Check if we should show dialog
                const isExamCompleted = window.examManagerCompleted || 
                                       (window.examManager && window.examManager.examCompleted) ||
                                       window.location.pathname.includes('result.html');
                
                if (!isExamCompleted && this.shouldShowDialog()) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Show custom modal
                    this.showReloadConfirmation();
                    return false;
                }
            }
        }, true); // Use capture phase

        // Override browser refresh attempts (disabled for results page)
        let isNavigatingAway = false;
        window.addEventListener('beforeunload', (e) => {
            // Check if exam is completed or on result page
            const isExamCompleted = window.examManagerCompleted || 
                                   (window.examManager && window.examManager.examCompleted) ||
                                   window.location.pathname.includes('result.html');
            
            if (!isNavigatingAway && !isExamCompleted && this.shouldShowDialog()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Prevent default browser dialog
                e.returnValue = '';
                
                // Show custom modal instead
                setTimeout(() => {
                    this.showReloadConfirmation();
                }, 10);
                
                return '';
            }
        }, true);
    }

    overrideBrowserDialogs() {
        // Store original functions
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        
        // Override alert function
        window.alert = (message) => {
            if (window.Swal) {
                Swal.fire({
                    title: 'Alert',
                    text: message,
                    icon: 'info',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#667eea'
                });
            } else {
                originalAlert(message);
            }
        };
        
        // Override confirm function
        window.confirm = (message) => {
            if (window.Swal) {
                return Swal.fire({
                    title: 'Confirm',
                    text: message,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#667eea',
                    cancelButtonColor: '#95a5a6'
                }).then((result) => {
                    return result.isConfirmed;
                });
            } else {
                return originalConfirm(message);
            }
        };
        
        console.log('✅ Browser dialogs overridden with custom modals');
        
        // Additional global override for any missed dialogs
        this.setupGlobalDialogOverride();
    }
    
    setupGlobalDialogOverride() {
        // Intercept any remaining browser dialogs
        const originalShowModalDialog = window.showModalDialog;
        if (originalShowModalDialog) {
            window.showModalDialog = () => {
                console.log('🚫 Blocked showModalDialog');
                return false;
            };
        }
        
        // Override any window.open with confirm-like behavior
        const originalOpen = window.open;
        window.open = function(...args) {
            // Allow normal window.open but log it
            console.log('🔗 Window.open called:', args);
            return originalOpen.apply(this, args);
        };
        
        // Block any remaining beforeunload returns
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'beforeunload' && this === window) {
                const wrappedListener = function(e) {
                    const result = listener.call(this, e);
                    // If listener tries to return a string, block it
                    if (typeof result === 'string') {
                        console.log('🚫 Blocked beforeunload string return');
                        return undefined;
                    }
                    return result;
                };
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    showReloadConfirmation() {
        console.log('🔄 Showing custom reload confirmation...');
        
        // Use SweetAlert2 for beautiful modal
        if (window.Swal) {
            Swal.fire({
                title: '🔄 Reload Site?',
                html: `
                    <div class="custom-reload-content">
                        <div class="reload-icon-container">
                            <i class="fas fa-sync-alt reload-spin-icon"></i>
                        </div>
                        <p class="reload-message">Changes that you made may not be saved.</p>
                        <div class="reload-checkbox-container">
                            <label class="custom-checkbox">
                                <input type="checkbox" id="preventDialogs">
                                <span class="checkmark"></span>
                                <span class="checkbox-text">Prevent this page from creating additional dialogues</span>
                            </label>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-sync-alt"></i> Reload',
                cancelButtonText: '<i class="fas fa-times"></i> Cancel',
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#95a5a6',
                allowOutsideClick: false,
                allowEscapeKey: true,
                width: '450px',
                padding: '0',
                background: '#fff',
                customClass: {
                    popup: 'custom-reload-popup',
                    title: 'custom-reload-title',
                    content: 'custom-reload-content-wrapper',
                    confirmButton: 'custom-reload-confirm',
                    cancelButton: 'custom-reload-cancel',
                    actions: 'custom-reload-actions'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Check if user wants to prevent future dialogs
                    const preventCheckbox = document.getElementById('preventDialogs');
                    if (preventCheckbox && preventCheckbox.checked) {
                        localStorage.setItem('preventReloadDialogs', 'true');
                        console.log('🔕 Future reload dialogs disabled');
                    }
                    
                    // Show loading and reload
                    this.performReload();
                } else {
                    console.log('❌ User cancelled page reload');
                }
            });
        } else {
            // Fallback to native confirm
            const shouldReload = confirm('Reload site?\n\nChanges that you made may not be saved.');
            if (shouldReload) {
                this.performReload();
            }
        }
    }

    performReload() {
        // Show beautiful loading modal
        if (window.Swal) {
            Swal.fire({
                title: '🔄 Reloading Page...',
                html: `
                    <div class="reload-loading-content">
                        <div class="loading-spinner">
                            <i class="fas fa-sync-alt fa-spin"></i>
                        </div>
                        <p>Please wait while the page refreshes</p>
                        <div class="loading-progress">
                            <div class="progress-bar"></div>
                        </div>
                    </div>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                width: '350px',
                customClass: {
                    popup: 'reload-loading-popup'
                }
            });
        }
        
        // Reload after brief delay
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Custom Reload Modal Styles */
            .custom-reload-popup {
                border-radius: 20px !important;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important;
                border: none !important;
                overflow: hidden !important;
            }

            .custom-reload-title {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                margin: 0 !important;
                padding: 25px !important;
                font-size: 1.4rem !important;
                font-weight: 600 !important;
                border-radius: 20px 20px 0 0 !important;
            }

            .custom-reload-content-wrapper {
                padding: 0 !important;
                margin: 0 !important;
            }

            .custom-reload-content {
                padding: 30px;
                text-align: center;
            }

            .reload-icon-container {
                margin-bottom: 20px;
            }

            .reload-spin-icon {
                font-size: 3rem;
                color: #667eea;
                animation: spin 2s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .reload-message {
                color: #666;
                font-size: 1rem;
                line-height: 1.5;
                margin: 0 0 25px 0;
            }

            .reload-checkbox-container {
                text-align: left;
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                border: 1px solid #e9ecef;
            }

            .custom-checkbox {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 0.9rem;
                color: #495057;
            }

            .custom-checkbox input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin-right: 12px;
                accent-color: #667eea;
                cursor: pointer;
            }

            .checkbox-text {
                line-height: 1.4;
                user-select: none;
            }

            .custom-reload-actions {
                padding: 20px 30px 30px !important;
                gap: 12px !important;
            }

            .custom-reload-confirm {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                border-radius: 12px !important;
                padding: 12px 24px !important;
                font-weight: 600 !important;
                font-size: 0.95rem !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
            }

            .custom-reload-confirm:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
            }

            .custom-reload-cancel {
                background: #f8f9fa !important;
                color: #6c757d !important;
                border: 2px solid #dee2e6 !important;
                border-radius: 12px !important;
                padding: 12px 24px !important;
                font-weight: 600 !important;
                font-size: 0.95rem !important;
                transition: all 0.3s ease !important;
            }

            .custom-reload-cancel:hover {
                background: #e9ecef !important;
                border-color: #adb5bd !important;
                transform: translateY(-1px) !important;
            }

            /* Loading Modal Styles */
            .reload-loading-popup {
                border-radius: 20px !important;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important;
            }

            .reload-loading-content {
                padding: 30px;
                text-align: center;
            }

            .loading-spinner {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 20px;
            }

            .reload-loading-content p {
                color: #666;
                margin: 0 0 25px 0;
                font-size: 1rem;
            }

            .loading-progress {
                width: 100%;
                height: 6px;
                background: #e9ecef;
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }

            .progress-bar {
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 3px;
                animation: loading 2s ease-in-out infinite;
            }

            @keyframes loading {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 100%; transform: translateX(0%); }
                100% { width: 100%; transform: translateX(100%); }
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                .custom-reload-popup {
                    width: 95% !important;
                    margin: 0 !important;
                }

                .custom-reload-content {
                    padding: 20px;
                }

                .custom-reload-actions {
                    flex-direction: column !important;
                    padding: 15px 20px 25px !important;
                }

                .custom-reload-confirm,
                .custom-reload-cancel {
                    width: 100% !important;
                    margin: 0 !important;
                }
            }

            /* Enhanced animations */
            .custom-reload-popup {
                animation: modalSlideIn 0.4s ease !important;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* Button press effects */
            .custom-reload-confirm:active,
            .custom-reload-cancel:active {
                transform: scale(0.98) !important;
            }

            /* Checkbox hover effects */
            .custom-checkbox:hover {
                background: rgba(102, 126, 234, 0.05);
                border-radius: 8px;
                margin: -5px;
                padding: 5px;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Check if user has disabled reload dialogs
    shouldShowDialog() {
        const preventDialogs = localStorage.getItem('preventReloadDialogs');
        return preventDialogs !== 'true';
    }

    // Manual reload function for testing
    static manualReload() {
        if (window.customReloadModal && window.customReloadModal.shouldShowDialog()) {
            window.customReloadModal.showReloadConfirmation();
        } else {
            window.location.reload(true);
        }
    }
}

// CUSTOM RELOAD MODAL COMPLETELY DISABLED
console.log('🚫 Custom Reload Modal initialization DISABLED');

// No initialization - preventing all reload dialogs
// document.addEventListener('DOMContentLoaded', () => {
//     window.customReloadModal = new CustomReloadModal();
//     console.log('✅ Custom Reload Modal initialized on DOM ready');
// });

// DISABLED - No custom reload modal
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         window.customReloadModal = new CustomReloadModal();
//     });
// } else {
//     window.customReloadModal = new CustomReloadModal();
// }

console.log('✅ Custom Reload Modal script loaded'); 