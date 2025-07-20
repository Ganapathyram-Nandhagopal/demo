// Code state management
const codeState = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>Welcome to the code compiler</p>
        <button onclick="changeColor()">Change Color</button>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 400px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

p {
    color: #666;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

button:hover {
    background: #5a6fd8;
}`,
    javascript: `function changeColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randomColor;
    
    console.log('Background color changed!');
}`
};

// Current active tab
let activeTab = 'html';
let isPreviewMode = false;

// DOM elements
const codeEditor = document.getElementById('codeEditor');
const outputFrame = document.getElementById('outputFrame');
const lineNumbers = document.getElementById('lineNumbers');
const editorSection = document.getElementById('editorSection');
const outputSection = document.getElementById('outputSection');
const togglePreviewBtn = document.getElementById('togglePreview');

// Tab management
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update active tab
    activeTab = tabName;
    
    // Update tab appearance
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update editor content
    codeEditor.value = codeState[tabName];
    updateLineNumbers();
    
    // Update placeholder
    const placeholders = {
        html: 'Enter your HTML code here...',
        css: 'Enter your CSS code here...',
        javascript: 'Enter your JavaScript code here...'
    };
    codeEditor.placeholder = placeholders[tabName];
}

// Line numbers management
function updateLineNumbers() {
    const lines = codeEditor.value.split('\n');
    const lineNumbersText = lines.map((_, index) => index + 1).join('\n');
    lineNumbers.textContent = lineNumbersText;
}

// Code editor event listeners
function initializeEditor() {
    codeEditor.addEventListener('input', (e) => {
        codeState[activeTab] = e.target.value;
        updateLineNumbers();
    });
    
    codeEditor.addEventListener('scroll', () => {
        lineNumbers.scrollTop = codeEditor.scrollTop;
    });
    
    // Handle tab key for indentation
    codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;
            
            codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
            codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
            
            codeState[activeTab] = codeEditor.value;
            updateLineNumbers();
        }
    });
}

// Code execution
function runCode() {
    const combinedCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Output</title>
    <style>${codeState.css}</style>
</head>
<body>
    ${codeState.html}
    <script>
        try {
            ${codeState.javascript}
        } catch (error) {
            console.error('JavaScript Error:', error);
            document.body.innerHTML += '<div class="error-message"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    outputFrame.src = url;
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Copy functionality
function copyCode() {
    const fullCode = `${codeState.html}\n\n<style>\n${codeState.css}\n</style>\n\n<script>\n${codeState.javascript}\n</script>`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(fullCode).then(() => {
            showNotification('Code copied to clipboard!');
        }).catch(() => {
            fallbackCopy(fullCode);
        });
    } else {
        fallbackCopy(fullCode);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Code copied to clipboard!');
    } catch (err) {
        showNotification('Failed to copy code');
    }
    
    document.body.removeChild(textArea);
}

// Download functionality
function downloadCode() {
    const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <style>
${codeState.css}
    </style>
</head>
<body>
${codeState.html}
    <script>
${codeState.javascript}
    </script>
</body>
</html>`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.html';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Project downloaded successfully!');
}

// Reset functionality
function resetCode() {
    if (confirm('Are you sure you want to reset all code? This action cannot be undone.')) {
        codeState.html = '';
        codeState.css = '';
        codeState.javascript = '';
        
        codeEditor.value = '';
        updateLineNumbers();
        runCode();
        
        showNotification('Code reset successfully!');
    }
}

// Preview mode toggle
function togglePreview() {
    isPreviewMode = !isPreviewMode;
    
    if (isPreviewMode) {
        editorSection.classList.add('hidden');
        outputSection.classList.add('full-width');
        togglePreviewBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16,18 22,12 16,6"></polyline>
                <polyline points="8,6 2,12 8,18"></polyline>
            </svg>
            Code
        `;
    } else {
        editorSection.classList.remove('hidden');
        outputSection.classList.remove('full-width');
        togglePreviewBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Preview
        `;
    }
}

// Notification system
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #238636;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Event listeners
function initializeEventListeners() {
    document.getElementById('runCode').addEventListener('click', runCode);
    document.getElementById('copyCode').addEventListener('click', copyCode);
    document.getElementById('downloadCode').addEventListener('click', downloadCode);
    document.getElementById('resetCode').addEventListener('click', resetCode);
    document.getElementById('togglePreview').addEventListener('click', togglePreview);
}

// Responsive handling
function handleResize() {
    if (window.innerWidth <= 768) {
        // Mobile view - stack vertically
        if (!isPreviewMode) {
            editorSection.style.height = '50%';
            outputSection.style.height = '50%';
        }
    } else {
        // Desktop view - side by side
        editorSection.style.height = 'auto';
        outputSection.style.height = 'auto';
    }
}

// Initialize the application
function init() {
    initializeTabs();
    initializeEditor();
    initializeEventListeners();
    
    // Set initial content
    switchTab('html');
    runCode();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Auto-run code when switching tabs (with debounce)
    let autoRunTimeout;
    codeEditor.addEventListener('input', () => {
        clearTimeout(autoRunTimeout);
        autoRunTimeout = setTimeout(runCode, 1000); // Auto-run after 1 second of inactivity
    });
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
