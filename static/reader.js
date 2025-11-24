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
    addHeadingIds();
    scrollToAnchor();
});

// Handle hash changes (when clicking TOC links on same page)
window.addEventListener('hashchange', scrollToAnchor);

// Add IDs to headings if they don't have one
function addHeadingIds() {
    const content = document.querySelector('.book-content');
    if (!content) return;
    
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
        if (!heading.id) {
            // Create ID from heading text
            const text = heading.textContent.trim();
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            
            heading.id = id || `heading-${index}`;
        }
    });
}

// Handle internal links in content
document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('.book-content');
    if (content) {
        content.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const hash = link.getAttribute('href').substring(1);
                scrollToElement(hash);
                window.location.hash = hash;
            }
        });
    }
});

/* ===== TOC Navigation ===== */
function findAndGo(filename, tocTitle) {
    console.log('=== findAndGo START ===');
    console.log('Filename:', filename);
    console.log('TOC Title:', tocTitle);
    
    // spineMap is defined in the HTML template
    const cleanFile = filename.split('#')[0];
    let anchor = filename.split('#')[1];
    const idx = window.spineMap[cleanFile];

    // If no anchor but we have TOC title, create anchor from title
    if (!anchor && tocTitle) {
        anchor = tocTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        console.log('Created anchor from title:', anchor);
    }

    if (idx !== undefined) {
        // Check if it's the same chapter
        const currentUrl = window.location.pathname;
        const targetUrl = `/read/${window.bookId}/${idx}`;
        
        console.log('Current URL:', currentUrl);
        console.log('Target URL:', targetUrl);
        console.log('Same chapter?', currentUrl === targetUrl);
        
        if (currentUrl === targetUrl) {
            // Same chapter
            if (anchor) {
                console.log('Same chapter, scrolling to anchor:', anchor);
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    scrollToElement(anchor);
                }, 100);
            } else {
                console.log('Same chapter, no anchor, scrolling to top');
                const mainContainer = document.getElementById('main');
                if (mainContainer) {
                    mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } else {
            // Different chapter, navigate
            let url = targetUrl;
            if (anchor) {
                url += '#' + anchor;
            }
            console.log('Navigating to:', url);
            window.location.href = url;
        }
    } else {
        console.error("Could not find index for", filename);
        console.log('Available spine entries:', Object.keys(window.spineMap));
    }
    console.log('=== findAndGo END ===');
}

// Scroll to specific element by ID or text
function scrollToElement(identifier) {
    console.log('Scrolling to:', identifier);
    
    let element = document.getElementById(identifier);
    console.log('Found by ID:', element);
    
    // Try to find by name attribute
    if (!element) {
        element = document.querySelector(`[name="${identifier}"]`);
        console.log('Found by name:', element);
    }
    
    // Try to find heading with matching text
    if (!element) {
        const searchText = identifier.toLowerCase().replace(/-|_/g, ' ').replace(/\./g, ' ').trim();
        const headings = document.querySelectorAll('.book-content h1, .book-content h2, .book-content h3, .book-content h4, .book-content h5, .book-content h6');
        
        console.log('Searching in', headings.length, 'headings for:', searchText);
        
        // First pass: exact match
        for (const heading of headings) {
            const headingText = heading.textContent.trim().toLowerCase();
            if (headingText === searchText) {
                element = heading;
                console.log('Found by exact match:', heading.textContent);
                break;
            }
        }
        
        // Second pass: contains match
        if (!element) {
            for (const heading of headings) {
                const headingText = heading.textContent.trim().toLowerCase();
                if (headingText.includes(searchText) || searchText.includes(headingText)) {
                    element = heading;
                    console.log('Found by contains match:', heading.textContent);
                    break;
                }
            }
        }
        
        // Third pass: fuzzy match (remove all spaces and special chars)
        if (!element) {
            const fuzzySearch = searchText.replace(/[^a-z0-9]/g, '');
            for (const heading of headings) {
                const fuzzyHeading = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (fuzzyHeading.includes(fuzzySearch) || fuzzySearch.includes(fuzzyHeading)) {
                    element = heading;
                    console.log('Found by fuzzy match:', heading.textContent);
                    break;
                }
            }
        }
    }
    
    // Last resort: search in all elements with text content
    if (!element) {
        const allElements = document.querySelectorAll('.book-content p, .book-content div, .book-content section, .book-content article');
        const searchText = identifier.toLowerCase().replace(/-|_/g, ' ').trim();
        
        for (const el of allElements) {
            const text = el.textContent.trim().toLowerCase();
            if (text.startsWith(searchText)) {
                element = el;
                console.log('Found in content (starts with):', el.textContent.substring(0, 50));
                break;
            }
        }
    }
    
    if (element) {
        console.log('Scrolling to element:', element);
        
        // Ensure element is in view
        const isMobile = window.innerWidth <= 768;
        const offset = isMobile ? 100 : 120;
        
        // Get the scrollable container - #main is the actual scroll container
        const mainContainer = document.getElementById('main');
        
        if (mainContainer) {
            // Calculate position relative to the scrollable container
            const containerRect = mainContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            // Current scroll position of the container
            const currentScroll = mainContainer.scrollTop;
            
            // Element position relative to container
            const elementTopRelativeToContainer = elementRect.top - containerRect.top;
            
            // Target scroll position
            const targetScrollPosition = currentScroll + elementTopRelativeToContainer - offset;
            
            console.log('Container scroll:', currentScroll);
            console.log('Element relative position:', elementTopRelativeToContainer);
            console.log('Target scroll position:', targetScrollPosition);
            
            // Scroll the container
            mainContainer.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback to window scroll
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const targetScrollPosition = absoluteElementTop - offset;
            
            console.log('Using window scroll. Target:', targetScrollPosition);
            
            window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
        }
        
        // Highlight element briefly
        setTimeout(() => {
            highlightElement(element);
        }, 400);
        
        // Update URL hash
        if (element.id) {
            history.replaceState(null, null, '#' + element.id);
        }
    } else {
        console.warn('Element not found for identifier:', identifier);
        console.log('Available headings:');
        const headings = document.querySelectorAll('.book-content h1, .book-content h2, .book-content h3');
        headings.forEach((h, i) => {
            console.log(`  ${i}: "${h.textContent.trim()}" (id: ${h.id || 'none'})`);
        });
    }
}

// Highlight element with animation
function highlightElement(element) {
    // Verify element is in viewport
    const mainContainer = document.getElementById('main');
    if (mainContainer) {
        const containerRect = mainContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        console.log('Container top:', containerRect.top, 'Element top:', elementRect.top);
        console.log('Element is visible:', elementRect.top >= containerRect.top && elementRect.top <= containerRect.bottom);
    }
    
    // Save original styles
    const originalBg = element.style.backgroundColor;
    const originalPadding = element.style.padding;
    const originalBorderRadius = element.style.borderRadius;
    const originalBoxShadow = element.style.boxShadow;
    const originalTransform = element.style.transform;
    
    // Apply highlight
    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = 'rgba(255, 204, 0, 0.5)';
    element.style.borderRadius = '6px';
    element.style.padding = '10px 14px';
    element.style.boxShadow = '0 0 0 5px rgba(255, 204, 0, 0.25)';
    element.style.transform = 'scale(1.03)';
    
    // Pulse effect
    setTimeout(() => {
        element.style.backgroundColor = 'rgba(255, 204, 0, 0.3)';
        element.style.boxShadow = '0 0 0 3px rgba(255, 204, 0, 0.15)';
        element.style.transform = 'scale(1.01)';
    }, 400);
    
    // Second pulse
    setTimeout(() => {
        element.style.backgroundColor = 'rgba(255, 204, 0, 0.4)';
        element.style.boxShadow = '0 0 0 4px rgba(255, 204, 0, 0.2)';
        element.style.transform = 'scale(1.02)';
    }, 800);
    
    // Fade out
    setTimeout(() => {
        element.style.backgroundColor = 'rgba(255, 204, 0, 0.15)';
        element.style.boxShadow = '0 0 0 2px rgba(255, 204, 0, 0.1)';
        element.style.transform = 'scale(1)';
    }, 1200);
    
    // Remove highlight
    setTimeout(() => {
        element.style.transition = 'all 0.5s ease';
        element.style.backgroundColor = originalBg;
        element.style.boxShadow = originalBoxShadow;
        element.style.transform = originalTransform;
        
        setTimeout(() => {
            element.style.padding = originalPadding;
            element.style.borderRadius = originalBorderRadius;
        }, 500);
    }, 3000);
}

// Scroll to anchor with offset for toolbar
function scrollToAnchor() {
    if (window.location.hash) {
        setTimeout(() => {
            const hash = window.location.hash.substring(1);
            console.log('scrollToAnchor called with hash:', hash);
            scrollToElement(hash);
        }, 300);
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
    const toolbar = document.querySelector('.translate-toolbar');
    const toggleBtn = document.querySelector('.toolbar-toggle');
    
    if (isHidden) {
        toolbar.classList.add('hidden');
        toggleBtn.style.display = 'flex';
    } else {
        toolbar.classList.remove('hidden');
        toggleBtn.style.display = 'none';
    }
}

function toggleToolbar() {
    const toolbar = document.querySelector('.translate-toolbar');
    const toggleBtn = document.querySelector('.toolbar-toggle');
    
    if (toolbar.classList.contains('hidden')) {
        // Show toolbar
        toolbar.classList.remove('hidden');
        toggleBtn.style.display = 'none';
        localStorage.setItem('toolbarHidden', 'false');
        showStatus('Toolbar shown', 'success');
    } else {
        // Hide toolbar
        toolbar.classList.add('hidden');
        toggleBtn.style.display = 'flex';
        localStorage.setItem('toolbarHidden', 'true');
        showStatus('Toolbar hidden (Press Ctrl+H or click 🌐 to show)', 'success');
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

