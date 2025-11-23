# 📚 My Digital Library - Complete Guide

## 🎉 New Features

### ✨ What's New

1. **📤 Upload EPUB Files** - Upload directly from browser!
2. **🔍 Search Functionality** - Find books by title or author
3. **🖼️ Book Covers** - Beautiful cover display
4. **🗑️ Delete Books** - Remove books you don't want
5. **📁 My-Library Folder** - All books organized in one place
6. **🎨 Modern UI** - Beautiful, responsive design
7. **⚡ Auto-Processing** - Upload → Process → Ready!

---

## 🚀 Quick Start

### 1. Start the Server
```bash
cd /home/hades/FUN/reader3
uv run server.py
```

### 2. Open Your Browser
```
http://127.0.0.1:8123
```

### 3. Upload Your First Book
- Click **"Upload EPUB"** button
- Select your `.epub` file
- Wait for auto-processing
- Start reading!

---

## 📤 Upload Methods

### Method 1: Browser Upload (RECOMMENDED!)
```
1. Open http://127.0.0.1:8123
2. Click "Upload EPUB" button
3. Select file or drag & drop
4. Done! Auto-processed ✅
```

### Method 2: Command Line (Advanced)
```bash
# From Windows path
uv run reader3.py 'F:\Downloads\book.epub'

# From WSL path
uv run reader3.py /mnt/f/Downloads/book.epub

# Relative path
uv run reader3.py ./mybook.epub
```

---

## 🔍 Search Feature

### How to Search:
1. Type in the search box at the top
2. Search by:
   - 📖 Book title
   - ✍️ Author name
3. Results update automatically (500ms delay)
4. Clear search to see all books

### Search Tips:
- Case-insensitive
- Partial match works
- Updates as you type
- Fast and responsive

---

## 🖼️ Book Covers

### Cover Display:
- ✅ Automatically extracts from EPUB
- ✅ Shows first image if no cover
- ✅ Fallback to 📚 emoji if no images
- ✅ 300px height, responsive width
- ✅ Hover effects for better UX

### Cover Priority:
1. Images with "cover" in filename
2. First image in book
3. Default book emoji 📚

---

## 📁 Folder Structure

```
/home/hades/FUN/reader3/
├── My-Library/                    ← All books here!
│   ├── Dracula_data/
│   │   ├── book.pkl
│   │   └── images/
│   │       └── cover.jpg
│   ├── Genocide_data/
│   │   ├── book.pkl
│   │   └── images/
│   └── brandon_data/
│       ├── book.pkl
│       └── images/
├── server.py
├── reader3.py
└── templates/
    └── library.html
```

---

## 🎨 UI Features

### Library Page:
- **Grid Layout** - Responsive, adapts to screen size
- **Book Cards** - Cover + Title + Author + Chapters
- **Hover Effects** - Smooth animations
- **Mobile Responsive** - Works great on phones
- **Modern Design** - Gradient backgrounds

### Buttons:
- 📖 **Read** - Start reading the book
- 🗑️ **Delete** - Remove from library
- 📤 **Upload** - Add new books
- 🔍 **Search** - Find books

### Colors:
- Primary: Purple gradient (#667eea → #764ba2)
- Accent: Blue (#3498db)
- Success: Green (#10b981)
- Danger: Red (#e74c3c)

---

## 🔧 API Endpoints

### GET `/`
- **Purpose:** Library home page
- **Query Params:** `?search=query`
- **Returns:** HTML page with book grid

### POST `/upload`
- **Purpose:** Upload EPUB file
- **Body:** multipart/form-data with file
- **Returns:** JSON with success status
- **Auto-processes:** ✅ Yes

### DELETE `/library/{book_id}`
- **Purpose:** Delete a book
- **Returns:** JSON with success status
- **Clears cache:** ✅ Yes

### GET `/read/{book_id}/{chapter}`
- **Purpose:** Read a chapter
- **Returns:** HTML reader page

### GET `/library/{book_id}/cover/{image}`
- **Purpose:** Serve book cover
- **Returns:** Image file

### POST `/api/translate`
- **Purpose:** Translate text
- **Body:** JSON with text, lang, provider
- **Returns:** Translation result

---

## ⚡ Performance

### Optimizations:
- ✅ LRU cache (20 books max)
- ✅ Lazy image loading
- ✅ Efficient file serving
- ✅ Fast search (client-side with debounce)
- ✅ Minimal re-renders
- ✅ Optimized CSS

### Speed:
- Upload: ~2-5s for typical book
- Search: Instant (debounced 500ms)
- Page load: <1s with cache
- Cover loading: Async, non-blocking

---

## 🛠️ Troubleshooting

### Upload Not Working?
1. Check file is `.epub` format
2. Check file size (large files take longer)
3. Check browser console for errors
4. Try command line method

### Covers Not Showing?
1. Some EPUBs don't have covers
2. Check `My-Library/{book}/images/` folder
3. Refresh browser (Ctrl+F5)
4. Default emoji 📚 shows if no images

### Search Not Working?
1. Wait 500ms after typing
2. Try clearing search and retry
3. Refresh page
4. Check spelling

### Books Not Appearing?
1. Check `My-Library/` folder exists
2. Check `{book}_data/book.pkl` exists
3. Restart server
4. Clear browser cache

---

## 📱 Mobile Support

### Features:
- ✅ Responsive grid (1-6 columns)
- ✅ Touch-friendly buttons (44px minimum)
- ✅ Swipe gestures
- ✅ Zoom support
- ✅ Portrait & landscape modes

### Breakpoints:
- Mobile: < 768px (1 column)
- Tablet: 769px - 1024px (2-3 columns)
- Desktop: > 1024px (3-5 columns)
- Large: > 1400px (4-6 columns)

---

## 🎯 Best Practices

### Organization:
- ✅ Use descriptive file names
- ✅ One EPUB per upload
- ✅ Delete old versions
- ✅ Keep My-Library folder clean

### Performance:
- ✅ Don't upload huge collections at once
- ✅ Delete books you don't read
- ✅ Use search for large libraries
- ✅ Keep server running for best speed

### Reading:
- ✅ Use translation feature for foreign books
- ✅ Toggle sidebar for focus mode
- ✅ Use keyboard shortcuts
- ✅ Bookmark chapters (via URL)

---

## 🚀 Advanced Features

### Custom Covers:
Replace cover manually:
```bash
cp my-cover.jpg My-Library/book_data/images/cover.jpg
```

### Bulk Import:
```bash
for file in *.epub; do
    uv run reader3.py "$file"
done
```

### Backup Library:
```bash
tar -czf my-library-backup.tar.gz My-Library/
```

### Restore:
```bash
tar -xzf my-library-backup.tar.gz
```

---

## 📊 Statistics

### Current Library:
```bash
# Count books
ls -1 My-Library/*_data | wc -l

# Total size
du -sh My-Library/

# List all books
ls -lh My-Library/
```

---

## 🆘 Support

### Getting Help:
1. Check this guide
2. Check WSL_PATH_GUIDE.md for path issues
3. Check TRANSLATE_README.md for translation
4. Check PROVIDER_GUIDE.md for API setup

### Common Commands:
```bash
# Start server
uv run server.py

# Process EPUB
uv run reader3.py book.epub

# Check server status
ps aux | grep server.py

# Kill server
pkill -f server.py

# View logs
tail -f server.log
```

---

## 🎉 Enjoy Your Library!

Your personal digital library is now ready! Upload books, search, read, and translate - all in one beautiful interface.

**Happy Reading! 📚✨**

