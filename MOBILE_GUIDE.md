# 📱 Mobile Guide - Reader3

## Responsive Design untuk Mobile & Tablet

### 🎯 Fitur Mobile

#### 1. **Adaptive Layout**
- **Mobile (≤768px)**: Sidebar di atas, collapsible
- **Tablet (769-1024px)**: Sidebar 250px, konten medium
- **Desktop (>1024px)**: Full sidebar, konten optimal

#### 2. **Toolbar Position**
- **Desktop**: Top-right, horizontal layout
- **Mobile**: Bottom, vertical 2-row layout
- **Always accessible** dengan floating button 🌐

#### 3. **Touch-Friendly**
- Semua button min **44x44px** (Apple guidelines)
- Tap highlight disabled untuk smooth UX
- Active states untuk touch feedback

### 📐 Breakpoints

```css
Mobile:    max-width: 768px
Tablet:    769px - 1024px  
Desktop:   min-width: 1025px
Large:     min-width: 1400px
```

### 🎨 Mobile Layout Changes

#### Sidebar:
```
Desktop:  300px fixed width, left side
Mobile:   100% width, top, collapsible (40vh max)
```

#### Toolbar:
```
Desktop:  Fixed top-right, horizontal
Mobile:   Fixed bottom, 2 rows, full width
```

#### Content:
```
Desktop:  700px max-width, padding 60px
Mobile:   100% width, padding 30px 20px
Tablet:   Similar to desktop, slightly smaller
```

### 🎯 Mobile Features

#### 1. Collapsible Sidebar
```javascript
// Tap ☰ button to toggle
toggleSidebar() → saves state to localStorage
Auto-collapse on page load (if previously collapsed)
```

#### 2. Bottom Toolbar
```
Row 1: 🌐 + Language Select (full width)
Row 2: [Select Text] [📄 Page] buttons
```

#### 3. Floating Button
```
Position: Bottom-right (56x56px)
States:   🌐 (hidden) / ✕ (visible)
Action:   Show/hide toolbar
```

### 📱 Testing on Mobile

#### Chrome DevTools:
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Test devices:
- iPhone 12/13/14 (390x844)
- iPhone SE (375x667)
- iPad (768x1024)
- Samsung Galaxy (360x800)
```

#### Real Device:
```
1. Start server: uv run server.py
2. Find your IP: ip addr show
3. Open on mobile: http://YOUR_IP:8123
```

### 🎨 Mobile-Specific Styles

#### Typography:
```css
Mobile:
  body: 1.05em
  p: text-align left (not justified)
  
Desktop:
  body: 1.15em
  p: text-align justify
```

#### Spacing:
```css
Mobile:
  content-padding: 30px 20px
  button-padding: 10px 12px
  
Desktop:
  content-padding: 60px 40px
  button-padding: 8px 16px
```

### ⚡ Performance Tips

1. **Lazy Load**: Images loaded on demand
2. **Minimal JS**: Event delegation
3. **CSS Transitions**: Hardware accelerated
4. **localStorage**: Persistent states

### 🔧 Customization

#### Adjust Sidebar Height (Mobile):
```css
/* In static/reader.css */
@media (max-width: 768px) {
  #sidebar {
    max-height: 40vh; /* Change this */
  }
}
```

#### Adjust Toolbar Size:
```css
.toolbar-toggle {
  width: 56px;   /* Change size */
  height: 56px;
  bottom: 20px;  /* Change position */
}
```

### 📊 Browser Support

✅ Chrome/Edge (Chromium) 90+  
✅ Safari iOS 14+  
✅ Firefox 88+  
✅ Samsung Internet 14+  
⚠️ IE11: Not supported (use modern browser)

### 🎯 Mobile UX Best Practices

1. **Touch Targets**: All interactive elements ≥44px
2. **Tap Highlight**: Disabled via CSS
3. **Viewport**: No horizontal scroll
4. **Font Size**: Minimum 14px
5. **Contrast**: WCAG AA compliant
6. **Loading**: Show progress indicators
7. **Offline**: Works without internet (except translate)

### 🌐 PWA Features (Future)

- [ ] Add to Home Screen
- [ ] Offline reading (Service Worker)
- [ ] Push notifications for new chapters
- [ ] Background sync for downloads

### 📸 Screenshots

#### Desktop View:
```
┌─────────────────────────────────────────┐
│ [Sidebar]  │  [Content]     [🌐 Toolbar]│
│   TOC      │   Reading      [Lang] [Btn]│
│            │   Area                      │
└─────────────────────────────────────────┘
```

#### Mobile View:
```
┌─────────────────────┐
│ [☰] Sidebar (Top)   │ ← Collapsible
├─────────────────────┤
│                     │
│   Reading Content   │
│   (Full Width)      │
│                     │
├─────────────────────┤
│ [🌐 Toolbar Bottom] │ ← Fixed
│ [Lang Select]       │
│ [Select] [📄 Page]  │
└─────────────────────┘
       [🌐]  ← Floating
```

---

**Optimized for all screen sizes** 📱💻🖥️

