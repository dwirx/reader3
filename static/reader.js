/* ========== Reader JavaScript Module ========== */

// Global state
let lastSelection = {
    text: '',
    range: null,
    container: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initTranslation();
    initKeyboardShortcuts();
    initToolbarToggle();
    initMobileFeatures();
});

/* ===== TOC Navigation ===== */
function findAndGo(filename) {
    // spineMap is defined in the HTML template
    const cleanFile = filename.split('#')[0];
    const anchor = filename.split('#')[1];
    const idx = window.spineMap[cleanFile];

    if (idx !== undefined) {
        let url = `/read/${window.bookId}/${idx}`;
        window.location.href = url;
    } else {
        console.log("Could not find index for", filename);
    }
}

/* ===== Translation Functions ===== */

function initTranslation() {
    // Track text selection
    document.addEventListener('selectionchange', handleSelectionChange);
}

function handleSelectionChange() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    const btn = document.getElementById('translateBtn');
    
    if (text.length > 0 && selection.rangeCount > 0) {
        lastSelection.text = text;
        lastSelection.range = selection.getRangeAt(0);
        lastSelection.container = selection.getRangeAt(0).commonAncestorContainer;
        
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">✨</span><span class="btn-text">Text</span>';
    } else {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-icon">✨</span><span class="btn-text">Text</span>';
    }
}

async function translateSelection() {
    if (!lastSelection.text || !lastSelection.range) {
        showStatus('Please select some text first!', 'error');
        return;
    }

    const targetLang = document.getElementById('targetLang').value;
    const provider = document.getElementById('providerSelect').value;
    const btn = document.getElementById('translateBtn');
    
    // Save original button state
    btn.disabled = true;
    btn.innerHTML = '<span class="translate-loading"></span><span class="btn-text">Wait...</span>';
    
    const providerName = provider === 'zai' ? 'Z.ai' : 'Google';
    showStatus(`Translating with ${providerName}...`, 'loading');

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: lastSelection.text,
                target_lang: targetLang,
                source_lang: 'auto',
                provider: provider
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Replace the selected text with translation
            replaceSelectedText(data.translated);
            const providerEmoji = data.provider === 'zai' ? '🤖' : '🌐';
            showStatus(`✓ ${providerEmoji} Translated from ${data.source_lang} to ${data.target_lang}`, 'success');
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        showStatus(`✗ Translation Error: ${error.message}`, 'error');
        console.error('Translation error:', error);
    } finally {
        // Restore button
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">✨</span><span class="btn-text">Text</span>';
        
        // Clear selection
        window.getSelection().removeAllRanges();
    }
}

function replaceSelectedText(translatedText) {
    if (!lastSelection.range) return;

    try {
        const range = lastSelection.range;
        const originalText = lastSelection.text;
        
        // Delete the original content
        range.deleteContents();
        
        // Create a new span with the translated text
        const span = document.createElement('span');
        span.className = 'translated-text-highlight';
        span.textContent = translatedText;
        span.setAttribute('data-original', originalText);
        span.setAttribute('data-translated', translatedText);
        span.setAttribute('data-state', 'translated');
        
        // Add click handler to toggle between original and translated
        span.addEventListener('click', function(e) {
            toggleTranslation(this);
        });
        
        // Insert the new span
        range.insertNode(span);
        
        // Clear the selection
        lastSelection = { text: '', range: null, container: null };
        
    } catch (error) {
        console.error('Error replacing text:', error);
        showStatus('Error replacing text', 'error');
    }
}

function toggleTranslation(element) {
    const state = element.getAttribute('data-state');
    const original = element.getAttribute('data-original');
    const translated = element.getAttribute('data-translated');
    
    if (state === 'translated') {
        // Switch to original
        element.textContent = original;
        element.setAttribute('data-state', 'original');
    } else {
        // Switch to translated
        element.textContent = translated;
        element.setAttribute('data-state', 'translated');
    }
}

function showStatus(message, type = 'loading') {
    let statusDiv = document.getElementById('translationStatus');
    
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'translationStatus';
        statusDiv.className = 'translation-status';
        document.body.appendChild(statusDiv);
    }
    
    statusDiv.textContent = message;
    statusDiv.className = `translation-status ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

/* ===== Keyboard Shortcuts ===== */

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+T to translate
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            translateSelection();
        }
        
        // Alt+Z to undo last translation (restore original)
        if (e.altKey && e.key === 'z') {
            e.preventDefault();
            undoLastTranslation();
        }
        
        // Ctrl+H to toggle toolbar
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            toggleToolbar();
        }
    });
}

function undoLastTranslation() {
    const highlights = document.querySelectorAll('.translated-text-highlight');
    if (highlights.length > 0) {
        const lastHighlight = highlights[highlights.length - 1];
        const originalText = lastHighlight.title.replace('Original: ', '');
        lastHighlight.textContent = originalText;
        lastHighlight.classList.remove('translated-text-highlight');
        showStatus('Undo: Restored original text', 'success');
    } else {
        showStatus('No translations to undo', 'error');
    }
}

/* ===== Helper Functions ===== */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ===== Translate Full Page ===== */

async function translateFullPage() {
    const targetLang = document.getElementById('targetLang').value;
    const provider = document.getElementById('providerSelect').value;
    const content = document.querySelector('.book-content');
    
    if (!content) {
        showStatus('No content found to translate', 'error');
        return;
    }
    
    // Get all paragraphs and headings
    const elements = content.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    
    if (elements.length === 0) {
        showStatus('No text elements found', 'error');
        return;
    }
    
    // Filter out already translated elements
    const toTranslate = Array.from(elements).filter(el => {
        // Skip if already has translated children
        return !el.querySelector('.translated-text-highlight') && el.textContent.trim().length > 0;
    });
    
    if (toTranslate.length === 0) {
        showStatus('All text already translated!', 'error');
        return;
    }
    
    const pageBtn = document.getElementById('translatePageBtn');
    pageBtn.disabled = true;
    pageBtn.innerHTML = '<span class="translate-loading"></span><span class="btn-text">Wait...</span>';
    
    const providerName = provider === 'zai' ? 'Z.ai' : 'Google';
    showStatus(`Translating ${toTranslate.length} elements with ${providerName}...`, 'loading');
    
    let successCount = 0;
    let failCount = 0;
    
    // Translate elements one by one with delay to avoid rate limiting
    for (let i = 0; i < toTranslate.length; i++) {
        const element = toTranslate[i];
        const originalText = element.textContent.trim();
        
        // Skip very short text
        if (originalText.length < 3) continue;
        
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: originalText,
                    target_lang: targetLang,
                    source_lang: 'auto',
                    provider: provider
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Wrap content in translatable span
                    const span = document.createElement('span');
                    span.className = 'translated-text-highlight';
                    span.textContent = data.translated;
                    span.setAttribute('data-original', originalText);
                    span.setAttribute('data-translated', data.translated);
                    span.setAttribute('data-state', 'translated');
                    span.addEventListener('click', function(e) {
                        toggleTranslation(this);
                    });
                    
                    element.textContent = '';
                    element.appendChild(span);
                    successCount++;
                }
            } else {
                failCount++;
            }
            
            // Update progress
            showStatus(`Progress: ${i + 1}/${toTranslate.length} (✓${successCount} ✗${failCount})`, 'loading');
            
            // Small delay to avoid rate limiting
            if (i < toTranslate.length - 1) {
                await sleep(300);
            }
            
        } catch (error) {
            console.error('Translation error:', error);
            failCount++;
        }
    }
    
    // Restore button
    pageBtn.disabled = false;
    pageBtn.innerHTML = '<span class="btn-icon">📄</span><span class="btn-text">Page</span>';
    
    const providerEmoji = provider === 'zai' ? '🤖' : '🌐';
    showStatus(`✓ ${providerEmoji} Page translated! Success: ${successCount}, Failed: ${failCount}`, 'success');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ===== Toolbar Toggle ===== */

function initToolbarToggle() {
    // Load saved state from localStorage
    const isHidden = localStorage.getItem('toolbarHidden') === 'true';
    if (isHidden) {
        document.querySelector('.translate-toolbar').classList.add('hidden');
        document.querySelector('.toolbar-toggle').classList.remove('toolbar-visible');
    } else {
        document.querySelector('.toolbar-toggle').classList.add('toolbar-visible');
    }
}

function toggleToolbar() {
    const toolbar = document.querySelector('.translate-toolbar');
    const toggleBtn = document.querySelector('.toolbar-toggle');
    
    if (toolbar.classList.contains('hidden')) {
        // Show toolbar
        toolbar.classList.remove('hidden');
        toggleBtn.classList.add('toolbar-visible');
        toggleBtn.innerHTML = '✕';
        localStorage.setItem('toolbarHidden', 'false');
        showStatus('Toolbar shown', 'success');
    } else {
        // Hide toolbar
        toolbar.classList.add('hidden');
        toggleBtn.classList.remove('toolbar-visible');
        toggleBtn.innerHTML = '🌐';
        localStorage.setItem('toolbarHidden', 'true');
        showStatus('Toolbar hidden (Press Ctrl+H or click 🌐)', 'success');
    }
}

/* ===== Mobile Features ===== */

function initMobileFeatures() {
    // Auto-collapse sidebar on mobile on load
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
    
    // Update on window resize
    window.addEventListener('resize', function() {
        updateMobileLayout();
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    const button = document.querySelector('.sidebar-toggle');
    button.innerHTML = isCollapsed ? '☰' : '✕';
}

function updateMobileLayout() {
    const isMobile = window.innerWidth <= 768;
    const toolbar = document.querySelector('.translate-toolbar');
    const toggleBtn = document.querySelector('.toolbar-toggle');
    
    if (isMobile) {
        // Adjust for mobile
        if (!toolbar.classList.contains('hidden')) {
            toggleBtn.classList.add('toolbar-visible');
        }
    }
}

// Export functions for inline onclick handlers
window.findAndGo = findAndGo;
window.translateSelection = translateSelection;
window.translateFullPage = translateFullPage;
window.toggleToolbar = toggleToolbar;
window.toggleSidebar = toggleSidebar;

