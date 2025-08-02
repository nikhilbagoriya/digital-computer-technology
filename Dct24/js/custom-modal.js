// Custom Modal System - Replace SweetAlert2
class CustomModal {
    constructor() {
        this.modalContainer = null;
        this.currentModal = null;
        this.queue = [];
        this.isVisible = false;
        this.createModalContainer();
    }

    createModalContainer() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('customModalContainer')) {
            const container = document.createElement('div');
            container.id = 'customModalContainer';
            container.innerHTML = `
                <div class="custom-modal-overlay" id="modalOverlay">
                    <div class="custom-modal" id="customModal">
                        <div class="modal-header" id="modalHeader">
                            <div class="modal-icon" id="modalIcon"></div>
                            <button class="modal-close" id="modalClose">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="modalBody">
                            <h3 class="modal-title" id="modalTitle"></h3>
                            <div class="modal-content" id="modalContent"></div>
                        </div>
                        <div class="modal-footer" id="modalFooter">
                            <!-- Buttons will be added dynamically -->
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(container);
            this.modalContainer = container;
            this.setupEventListeners();
            this.addStyles();
        }
    }

    addStyles() {
        if (!document.getElementById('customModalStyles')) {
            const style = document.createElement('style');
            style.id = 'customModalStyles';
            style.textContent = `
                .custom-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                }

                .custom-modal-overlay.show {
                    opacity: 1;
                    visibility: visible;
                }

                .custom-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow: auto;
                    transform: scale(0.7) translateY(-50px);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .custom-modal-overlay.show .custom-modal {
                    transform: scale(1) translateY(0);
                }

                .modal-header {
                    padding: 1.5rem 1.5rem 0 1.5rem;
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }

                .modal-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    margin: 0 auto 1rem auto;
                    position: relative;
                }

                .modal-icon.success {
                    background: linear-gradient(135deg, #4caf50, #66bb6a);
                    color: white;
                    animation: successPulse 0.6s ease;
                }

                .modal-icon.error {
                    background: linear-gradient(135deg, #f44336, #e57373);
                    color: white;
                    animation: errorShake 0.6s ease;
                }

                .modal-icon.warning {
                    background: linear-gradient(135deg, #ff9800, #ffb74d);
                    color: white;
                    animation: warningBounce 0.6s ease;
                }

                .modal-icon.info {
                    background: linear-gradient(135deg, #2196f3, #64b5f6);
                    color: white;
                    animation: infoPulse 0.6s ease;
                }

                .modal-icon.question {
                    background: linear-gradient(135deg, #9c27b0, #ba68c8);
                    color: white;
                    animation: questionWiggle 0.6s ease;
                }

                @keyframes successPulse {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                @keyframes warningBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes infoPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes questionWiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-5deg); }
                    75% { transform: rotate(5deg); }
                }

                .modal-close {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: #999;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .modal-close:hover {
                    background: #f5f5f5;
                    color: #333;
                    // transform: scale(1.1);
                }

                .modal-body {
                    padding: 0 1.5rem 1.5rem 1.5rem;
                    text-align: center;
                }

                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #333;
                    line-height: 1.3;
                }

                .modal-content {
                    font-size: 1rem;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .modal-footer {
                    padding: 0 1.5rem 1.5rem 1.5rem;
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .modal-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 100px;
                    position: relative;
                    overflow: hidden;
                }

                .modal-btn:before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .modal-btn:active:before {
                    width: 300px;
                    height: 300px;
                }

                .modal-btn.primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .modal-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                .modal-btn.success {
                    background: linear-gradient(135deg, #4caf50, #66bb6a);
                    color: white;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }

                .modal-btn.success:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }

                .modal-btn.danger {
                    background: linear-gradient(135deg, #f44336, #e57373);
                    color: white;
                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
                }

                .modal-btn.danger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
                }

                .modal-btn.secondary {
                    background: #f8f9fa;
                    color: #495057;
                    border: 2px solid #e9ecef;
                }

                .modal-btn.secondary:hover {
                    background: #e9ecef;
                    transform: translateY(-1px);
                }

                .modal-loading {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 0.5rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 600px) {
                    .custom-modal {
                        width: 95%;
                        margin: 1rem;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }

                    .modal-btn {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupEventListeners() {
        const overlay = document.getElementById('modalOverlay');
        const closeBtn = document.getElementById('modalClose');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        // Close on close button click
        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.close();
            }
        });
    }

    show(options = {}) {
        return new Promise((resolve) => {
            const defaultOptions = {
                title: '',
                html: '',
                text: '',
                icon: 'info',
                showCancelButton: false,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                confirmButtonColor: 'primary',
                cancelButtonColor: 'secondary',
                allowOutsideClick: true,
                allowEscapeKey: true,
                timer: null,
                showCloseButton: true
            };

            const config = { ...defaultOptions, ...options };
            
            const overlay = document.getElementById('modalOverlay');
            const modal = document.getElementById('customModal');
            const icon = document.getElementById('modalIcon');
            const title = document.getElementById('modalTitle');
            const content = document.getElementById('modalContent');
            const footer = document.getElementById('modalFooter');
            const closeBtn = document.getElementById('modalClose');

            // Set icon
            icon.className = `modal-icon ${config.icon}`;
            icon.innerHTML = this.getIconHtml(config.icon);

            // Set title  
            title.innerHTML = config.title;
            title.style.display = config.title ? 'block' : 'none';

            // Set content
            if (config.html) {
                content.innerHTML = config.html;
            } else if (config.text) {
                content.innerHTML = config.text.replace(/\n/g, '<br>');
            } else {
                content.textContent = '';
            }

            // Show/hide close button
            closeBtn.style.display = config.showCloseButton ? 'block' : 'none';

            // Create buttons
            footer.innerHTML = '';
            
            if (config.showCancelButton) {
                const cancelBtn = document.createElement('button');
                // Map color names to CSS classes for cancel button
                let cancelColorClass = config.cancelButtonColor;
                if (cancelColorClass === '#6c757d' || cancelColorClass === 'gray') cancelColorClass = 'secondary';
                if (!['primary', 'success', 'danger', 'secondary'].includes(cancelColorClass)) {
                    cancelColorClass = 'secondary';
                }
                
                cancelBtn.className = `modal-btn ${cancelColorClass}`;
                cancelBtn.innerHTML = config.cancelButtonText;
                cancelBtn.onclick = () => {
                    this.close();
                    resolve({ isConfirmed: false, isDismissed: true });
                };
                footer.appendChild(cancelBtn);
            }

            if (config.showConfirmButton) {
                const confirmBtn = document.createElement('button');
                // Map color names to CSS classes
                let colorClass = config.confirmButtonColor;
                if (colorClass === '#4caf50' || colorClass === 'green') colorClass = 'success';
                if (colorClass === '#2196f3' || colorClass === 'blue') colorClass = 'primary';
                if (colorClass === '#f44336' || colorClass === 'red') colorClass = 'danger';
                if (!['primary', 'success', 'danger', 'secondary'].includes(colorClass)) {
                    colorClass = 'primary';
                }
                
                confirmBtn.className = `modal-btn ${colorClass}`;
                confirmBtn.innerHTML = config.confirmButtonText;
                confirmBtn.onclick = () => {
                    this.close();
                    resolve({ isConfirmed: true, isDismissed: false });
                };
                footer.appendChild(confirmBtn);
            }

            // Show modal
            this.isVisible = true;
            overlay.classList.add('show');

            // Auto close timer
            if (config.timer) {
                setTimeout(() => {
                    this.close();
                    resolve({ isConfirmed: false, isDismissed: true });
                }, config.timer);
            }

            // Override close behavior for this instance
            this.currentResolve = resolve;
            this.currentConfig = config;
        });
    }

    getIconHtml(type) {
        const icons = {
            success: '<i class="fas fa-check"></i>',
            error: '<i class="fas fa-times"></i>',
            warning: '<i class="fas fa-exclamation"></i>',
            info: '<i class="fas fa-info"></i>',
            question: '<i class="fas fa-question"></i>'
        };
        return icons[type] || icons.info;
    }

    close() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            this.isVisible = false;
        }
    }

    // Convenience methods to match SweetAlert2 API
    fire(options) {
        if (typeof options === 'string') {
            return this.show({ title: options });
        }
        return this.show(options);
    }

    // Show loading state
    showLoading() {
        const confirmBtn = document.querySelector('.modal-btn.primary, .modal-btn.success');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            const originalText = confirmBtn.textContent;
            confirmBtn.innerHTML = `<span class="modal-loading"></span>${originalText}`;
            confirmBtn.setAttribute('data-original-text', originalText);
        }
    }

    // Hide loading state
    hideLoading() {
        const confirmBtn = document.querySelector('.modal-btn.primary, .modal-btn.success');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            const originalText = confirmBtn.getAttribute('data-original-text');
            if (originalText) {
                confirmBtn.textContent = originalText;
                confirmBtn.removeAttribute('data-original-text');
            }
        }
    }
}

// Create global instance
const customModal = new CustomModal();

// Replace global Swal with our custom modal
window.Swal = {
    fire: (options) => customModal.fire(options),
    close: () => customModal.close(),
    showLoading: () => customModal.showLoading(),
    hideLoading: () => customModal.hideLoading()
};

// Export for module use
export default customModal; 