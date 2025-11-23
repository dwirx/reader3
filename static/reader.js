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
        const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
        btn.innerHTML = `🌐 Translate`;
    } else {
        btn.disabled = true;
        btn.innerHTML = 'Select Text First';
    }
}

async function translateSelection() {
    if (!lastSelection.text || !lastSelection.range) {
        showStatus('Please select some text first!', 'error');
        return;
    }

    const targetLang = document.getElementById('targetLang').value;
    const btn = document.getElementById('translateBtn');
    
    // Save original button state
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="translate-loading"></span> Translating...';
    
    showStatus('Translating...', 'loading');

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: lastSelection.text,
                target_lang: targetLang,
                source_lang: 'auto'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Replace the selected text with translation
            replaceSelectedText(data.translated);
            showStatus(`✓ Translated from ${data.source_lang} to ${data.target_lang}`, 'success');
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        showStatus(`✗ Translation Error: ${error.message}`, 'error');
        console.error('Translation error:', error);
    } finally {
        // Restore button
        btn.disabled = false;
        btn.innerHTML = 'Select Text First';
        
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
        element.style.background = 'linear-gradient(120deg, #dbeafe 0%, #bfdbfe 100%)';
        element.style.borderBottomColor = '#3b82f6';
    } else {
        // Switch to translated
        element.textContent = translated;
        element.setAttribute('data-state', 'translated');
        element.style.background = '';
        element.style.borderBottomColor = '';
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
    pageBtn.innerHTML = '<span class="translate-loading"></span> Translating Page...';
    
    showStatus(`Translating ${toTranslate.length} elements...`, 'loading');
    
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
                    source_lang: 'auto'
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
    pageBtn.innerHTML = '📄 Translate Page';
    
    showStatus(`✓ Page translated! Success: ${successCount}, Failed: ${failCount}`, 'success');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions for inline onclick handlers
window.findAndGo = findAndGo;
window.translateSelection = translateSelection;
window.translateFullPage = translateFullPage;

