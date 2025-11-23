# 🪟 Windows Path Support for WSL

## ✅ Problem Solved!

Script `reader3.py` sekarang **otomatis mengkonversi** Windows path ke WSL path!

## 🎯 Cara Pakai

### Sebelumnya (❌ Error):
```bash
uv run reader3.py "F:\2026\Downloads\book.epub"
# Error: AssertionError: File not found.
```

### Sekarang (✅ Otomatis Convert):
```bash
uv run reader3.py 'F:\2026\Downloads\book.epub'
# 🔄 Converted Windows path to WSL path:
#    From: F:\2026\Downloads\book.epub
#    To:   /mnt/f/2026/Downloads/book.epub
# 
# ✅ Processing...
```

## 📝 Format Path yang Didukung

### 1. Windows Path (Otomatis dikonversi)
```bash
uv run reader3.py 'F:\2026\Downloads\book.epub'
uv run reader3.py 'C:\Users\YourName\Documents\book.epub'
uv run reader3.py 'D:\Books\fiction\book.epub'
```

**Penting:** Gunakan **single quotes** (`'`) untuk Windows path!

### 2. WSL Path (Langsung)
```bash
uv run reader3.py /mnt/f/2026/Downloads/book.epub
uv run reader3.py /mnt/c/Users/YourName/Documents/book.epub
```

### 3. Relative Path
```bash
uv run reader3.py ./book.epub
uv run reader3.py ../downloads/book.epub
```

## 🔍 Conversion Logic

```python
# Windows → WSL Conversion
F:\2026\Downloads\book.epub  →  /mnt/f/2026/Downloads/book.epub
C:\Users\John\book.epub      →  /mnt/c/Users/John/book.epub
D:\Data\ebooks\book.epub     →  /mnt/d/Data/ebooks/book.epub
```

## 💡 Tips & Troubleshooting

### ✅ Do This:
```bash
# Use single quotes for Windows paths
uv run reader3.py 'F:\Downloads\book.epub'

# Or use WSL path directly
uv run reader3.py /mnt/f/Downloads/book.epub

# Check if file exists first
ls -la /mnt/f/Downloads/*.epub
```

### ❌ Don't Do This:
```bash
# Double quotes might cause escaping issues
uv run reader3.py "F:\Downloads\book.epub"  # May work, but not recommended

# Missing quotes
uv run reader3.py F:\Downloads\book.epub  # Will fail
```

## 🛠️ Cara Cek File Exists

```bash
# Check folder
ls -la /mnt/f/2026/Downloads/

# Search for specific file
ls -la /mnt/f/2026/Downloads/ | grep -i "genocide"

# Full path check
test -f "/mnt/f/2026/Downloads/book.epub" && echo "Found!" || echo "Not found"
```

## 📚 Complete Workflow

```bash
# 1. Check file exists in Windows path
ls -la /mnt/f/2026/Downloads/*.epub

# 2. Process EPUB (Windows path dengan quotes)
uv run reader3.py 'F:\2026\Downloads\Genocide of One (Jenosaido) (Kazuaki.epub'

# 3. Move to project folder (optional)
mv '/mnt/f/2026/Downloads/Genocide of One (Jenosaido) (Kazuaki_data' ./Genocide_data

# 4. Start server
uv run server.py

# 5. Open browser
# http://127.0.0.1:8123
```

## 🎉 Features

- ✅ Automatic Windows to WSL path conversion
- ✅ Support semua drive letters (C:, D:, F:, etc.)
- ✅ Handle spaces in filename
- ✅ Handle special characters
- ✅ Clear error messages jika file tidak ditemukan
- ✅ Tips debugging otomatis

## 📖 Error Messages

### File Not Found:
```
❌ Error: File not found!
   Path: /mnt/f/2026/Downloads/book.epub

💡 Tips:
   - Make sure the file path is correct
   - For Windows paths in WSL, use quotes: 'F:\path\to\file.epub'
   - Or use WSL path format: /mnt/f/path/to/file.epub
   - Check if the file exists: ls -la "$(dirname /mnt/f/2026/Downloads/)"
```

## 🔗 Related Files

- `reader3.py` - Main EPUB processor with path conversion
- `server.py` - Web server for reading books
- `README.md` - General documentation

---

**Made with ❤️ for WSL users who love reading EPUB books!**

