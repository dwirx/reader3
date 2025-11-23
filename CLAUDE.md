# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reader3 is a lightweight, self-hosted EPUB reader designed to make reading books with LLMs easy. It extracts EPUB files into a web-readable format and serves them through a FastAPI-based web interface. The project emphasizes simplicity - books are stored as `*_data` folders containing pickled Python objects and extracted images.

## Development Commands

### Setup and Installation
```bash
# Uses uv for dependency management (requires uv installed)
uv run reader3.py <file.epub>  # Process an EPUB file
uv run server.py               # Start the web server
```

### Running the Application
```bash
# 1. Process an EPUB file (creates {bookname}_data folder)
uv run reader3.py dracula.epub

# 2. Start the server (runs on http://127.0.0.1:8123)
uv run server.py
```

The server automatically:
- Scans for all `*_data` folders in the current directory
- Loads books from their `book.pkl` files
- Caches loaded books using `@lru_cache(maxsize=10)`

## Architecture

### Two-Phase Processing Model

1. **EPUB Processing (`reader3.py`)**: Converts EPUB → structured data
2. **Web Serving (`server.py`)**: Serves the processed data through FastAPI

### Core Data Structures

All data structures are defined in `reader3.py`:

- **Book**: Master object (pickled to `book.pkl`)
  - `metadata`: BookMetadata (title, authors, etc.)
  - `spine`: List[ChapterContent] - Linear reading order (physical files)
  - `toc`: List[TOCEntry] - Navigation tree (logical structure)
  - `images`: Dict[str, str] - Image path mappings

- **ChapterContent**: Represents a physical file from the EPUB spine
  - Contains cleaned HTML with rewritten image paths
  - Includes both `content` (HTML) and `text` (plain text for LLMs)
  - Indexed by `order` for linear navigation

- **TOCEntry**: Logical navigation entry
  - Can have nested children (recursive structure)
  - Links to spine items via `file_href`
  - May include `anchor` for intra-chapter links

### Key Implementation Details

**EPUB Processing Flow** (`reader3.py:process_epub`):
1. Extract metadata from DC fields
2. Extract and save images to `{book}_data/images/`
3. Build image path mapping (handles both full paths and basenames)
4. Parse TOC recursively (handles Link, Section, and tuple formats)
5. Process spine items in linear order:
   - Clean HTML (remove scripts, styles, nav, etc.)
   - Rewrite image src attributes to local paths
   - Extract plain text for LLM usage
   - Save only body content (not full HTML document)

**Chapter Navigation** (`server.py:read_chapter`):
- Accepts both integer indices (0, 1, 2...) and filenames ("text/chapter1.html")
- Integer parsing is tried first, filename matching second
- TOC links are resolved via JavaScript using a spine map (templates/reader.html:179-203)

**Image Serving**:
- Images use relative paths in HTML: `<img src="images/pic.jpg">`
- Browser resolves to: `/read/{book_id}/images/pic.jpg`
- Server uses `os.path.basename()` for security (prevents path traversal)

**Translation Feature** (server.py:133-169):
- Uses Google Translate's unofficial API endpoint
- Frontend allows selecting text and translating to multiple languages
- Keyboard shortcut: Ctrl+Shift+T

### File Structure

```
.
├── reader3.py              # EPUB processing
├── server.py               # FastAPI web server
├── templates/
│   ├── library.html        # Book library grid view
│   └── reader.html         # Chapter reading interface with sidebar TOC
├── {bookname}_data/        # Created per book
│   ├── book.pkl           # Pickled Book object
│   └── images/            # Extracted images
└── pyproject.toml         # Dependencies (uv format)
```

## Important Constraints

### Book Data Format
- Books are stored as pickled Python objects (`book.pkl`)
- Changing data structures in `reader3.py` requires reprocessing all books
- Image filenames are sanitized (only alphanumeric, `.`, `_`, `-`)

### TOC vs Spine Mismatch
- TOC represents logical structure (chapters, sections)
- Spine represents physical files (may contain multiple chapters)
- Navigation uses spine indices (0, 1, 2...) for prev/next
- TOC links are resolved to spine indices via JavaScript mapping

### Caching
- Server caches loaded books with `@lru_cache(maxsize=10)`
- Cache is NOT invalidated when book.pkl changes
- Restart server to reload modified books

### Security
- All file paths use `os.path.basename()` to prevent traversal
- HTML is cleaned but NOT sanitized (BeautifulSoup removes scripts/iframes)
- Server only serves from `*_data/images/` directories
