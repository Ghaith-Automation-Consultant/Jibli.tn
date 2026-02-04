/**
 * Utility functions for Jibli.tn
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.className = `${colors[type] || 'bg-gray-800'} text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full opacity-0 flex items-center min-w-[300px]`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'} mr-3 text-xl"></i>
        <span class="font-medium">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            container.removeChild(toast);
            if (container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300);
    }, duration);
}

// Export for module usage if needed, but primarily global for vanilla JS
if (typeof module !== 'undefined') {
    module.exports = { showToast };
}
