import os
import pickle
import shutil
import tempfile
from functools import lru_cache
from typing import Optional, List
import urllib.parse
import urllib.request
import json
from dotenv import load_dotenv
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from reader3 import Book, BookMetadata, ChapterContent, TOCEntry, process_epub, save_to_pickle

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Where are the book folders located?
BOOKS_DIR = "My-Library"
UPLOAD_DIR = "My-Library"

# Ensure directories exist
os.makedirs(BOOKS_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic model for translation request
class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "id"  # default to Indonesian
    source_lang: str = "auto"  # auto-detect
    provider: str = "zai"  # default to Z.ai ("zai" or "google")

@lru_cache(maxsize=20)
def load_book_cached(folder_name: str) -> Optional[Book]:
    """
    Loads the book from the pickle file.
    Cached so we don't re-read the disk on every click.
    """
    # Handle both absolute and relative paths
    if folder_name.startswith(BOOKS_DIR):
        file_path = os.path.join(folder_name, "book.pkl")
    else:
        file_path = os.path.join(BOOKS_DIR, folder_name, "book.pkl")
    
    if not os.path.exists(file_path):
        return None

    try:
        with open(file_path, "rb") as f:
            book = pickle.load(f)
        return book
    except Exception as e:
        print(f"Error loading book {folder_name}: {e}")
        return None

@app.get("/", response_class=HTMLResponse)
async def library_view(request: Request, search: Optional[str] = None):
    """Lists all available processed books."""
    books = []

    # Scan directory for folders ending in '_data' that have a book.pkl
    if os.path.exists(BOOKS_DIR):
        for item in os.listdir(BOOKS_DIR):
            item_path = os.path.join(BOOKS_DIR, item)
            if item.endswith("_data") and os.path.isdir(item_path):
                # Try to load it to get the title
                book = load_book_cached(item)
                if book:
                    # Check for cover image
                    cover_path = None
                    cover_url = None
                    images_dir = os.path.join(item_path, "images")
                    if os.path.exists(images_dir):
                        # Look for cover image (common names)
                        for cover_name in os.listdir(images_dir):
                            if 'cover' in cover_name.lower():
                                cover_path = os.path.join(images_dir, cover_name)
                                cover_url = f"/library/{item}/cover/{cover_name}"
                                break
                        # If no cover found, use first image
                        if not cover_url and os.listdir(images_dir):
                            first_image = sorted(os.listdir(images_dir))[0]
                            cover_url = f"/library/{item}/cover/{first_image}"
                    
                    book_data = {
                        "id": item,
                        "title": book.metadata.title,
                        "author": ", ".join(book.metadata.authors) if book.metadata.authors else "Unknown",
                        "chapters": len(book.spine),
                        "cover": cover_url,
                        "description": book.metadata.description or ""
                    }
                    
                    # Apply search filter if provided
                    if search:
                        search_lower = search.lower()
                        if (search_lower in book_data["title"].lower() or 
                            search_lower in book_data["author"].lower()):
                            books.append(book_data)
                    else:
                        books.append(book_data)
    
    # Sort books by title
    books.sort(key=lambda x: x["title"].lower())

    return templates.TemplateResponse("library.html", {
        "request": request, 
        "books": books,
        "search_query": search or ""
    })

@app.get("/read/{book_id}", response_class=HTMLResponse)
async def redirect_to_first_chapter(request: Request, book_id: str):
    """Helper to just go to chapter 0."""
    return await read_chapter(request=request, book_id=book_id, chapter_identifier="0")

@app.get("/read/{book_id}/{chapter_identifier}", response_class=HTMLResponse)
async def read_chapter(request: Request, book_id: str, chapter_identifier: str):
    """The main reader interface. Accepts either integer index or filename."""
    book = load_book_cached(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Try to parse as integer first (for index-based navigation)
    chapter_index = None
    try:
        chapter_index = int(chapter_identifier)
        if chapter_index < 0 or chapter_index >= len(book.spine):
            raise HTTPException(status_code=404, detail="Chapter index out of range")
    except ValueError:
        # Not an integer, treat as filename
        # Search for the chapter by href (filename)
        for idx, chapter in enumerate(book.spine):
            # Match the filename, handling various formats
            # The href might be "text/chapter1.html" but chapter_identifier might be full or partial
            if chapter.href == chapter_identifier or chapter.href.endswith(chapter_identifier):
                chapter_index = idx
                break
        
        if chapter_index is None:
            raise HTTPException(status_code=404, detail=f"Chapter with filename '{chapter_identifier}' not found")

    current_chapter = book.spine[chapter_index]

    # Calculate Prev/Next links
    prev_idx = chapter_index - 1 if chapter_index > 0 else None
    next_idx = chapter_index + 1 if chapter_index < len(book.spine) - 1 else None

    return templates.TemplateResponse("reader.html", {
        "request": request,
        "book": book,
        "current_chapter": current_chapter,
        "chapter_index": chapter_index,
        "book_id": book_id,
        "prev_idx": prev_idx,
        "next_idx": next_idx
    })

@app.get("/read/{book_id}/images/{image_name}")
async def serve_image(book_id: str, image_name: str):
    """
    Serves images specifically for a book.
    The HTML contains <img src="images/pic.jpg">.
    The browser resolves this to /read/{book_id}/images/pic.jpg.
    """
    # Security check: ensure book_id is clean
    safe_book_id = os.path.basename(book_id)
    safe_image_name = os.path.basename(image_name)

    img_path = os.path.join(BOOKS_DIR, safe_book_id, "images", safe_image_name)

    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(img_path)

@app.get("/library/{book_id}/cover/{image_name}")
async def serve_cover(book_id: str, image_name: str):
    """Serve book cover images for library view."""
    safe_book_id = os.path.basename(book_id)
    safe_image_name = os.path.basename(image_name)
    
    img_path = os.path.join(BOOKS_DIR, safe_book_id, "images", safe_image_name)
    
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Cover not found")
    
    return FileResponse(img_path)

@app.post("/upload")
async def upload_epub(file: UploadFile = File(...)):
    """Upload and automatically process an EPUB file."""
    try:
        # Validate file extension
        if not file.filename.endswith('.epub'):
            raise HTTPException(status_code=400, detail="Only EPUB files are allowed")
        
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.epub') as temp_file:
            # Save uploaded file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Generate output directory name
            book_name = os.path.splitext(file.filename)[0]
            # Clean the name for directory
            safe_name = "".join(c for c in book_name if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_name = safe_name.replace(' ', '_')
            out_dir = os.path.join(UPLOAD_DIR, f"{safe_name}_data")
            
            # Process the EPUB
            book_obj = process_epub(temp_file_path, out_dir)
            save_to_pickle(book_obj, out_dir)
            
            # Clear cache so new book appears
            load_book_cached.cache_clear()
            
            return JSONResponse({
                "success": True,
                "message": f"Book '{book_obj.metadata.title}' uploaded and processed successfully!",
                "book_id": os.path.basename(out_dir),
                "title": book_obj.metadata.title,
                "chapters": len(book_obj.spine)
            })
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing EPUB: {str(e)}")

@app.delete("/library/{book_id}")
async def delete_book(book_id: str):
    """Delete a book from library."""
    try:
        safe_book_id = os.path.basename(book_id)
        book_path = os.path.join(BOOKS_DIR, safe_book_id)
        
        if not os.path.exists(book_path):
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Delete the directory
        shutil.rmtree(book_path)
        
        # Clear cache
        load_book_cached.cache_clear()
        
        return JSONResponse({"success": True, "message": "Book deleted successfully"})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting book: {str(e)}")

@app.post("/api/translate")
async def translate_text(req: TranslateRequest):
    """
    Translate text using either Z.ai API or Google Translate.
    Returns JSON with translated text and detected source language.
    """
    try:
        if req.provider == "zai":
            return await translate_with_zai(req)
        elif req.provider == "google":
            return await translate_with_google(req)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid provider: {req.provider}. Use 'zai' or 'google'")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

async def translate_with_zai(req: TranslateRequest):
    """Translate using Z.ai API (GLM-4.5-flash model)"""
    # Get API credentials from environment variables
    api_key = os.getenv("ZAI_API_KEY")
    api_url = os.getenv("ZAI_API_URL", "https://api.z.ai/api/paas/v4/chat/completions")
    model = os.getenv("ZAI_MODEL", "glm-4.5-flash")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="ZAI_API_KEY not configured in .env file")
    
    # Map language codes to full language names for better translation
    lang_map = {
        "id": "Indonesian",
        "en": "English",
        "zh-CN": "Chinese (Simplified)",
        "ja": "Japanese",
        "ko": "Korean",
        "ar": "Arabic",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "ru": "Russian",
        "pt": "Portuguese",
        "it": "Italian",
        "th": "Thai",
        "vi": "Vietnamese"
    }
    
    target_language = lang_map.get(req.target_lang, req.target_lang)
    
    # Prepare the translation prompt
    prompt = f"Translate the following text to {target_language}. Only provide the translation without any explanations or additional text:\n\n{req.text}"
    
    # Prepare the API request
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False
    }
    
    # Make the API request
    request_obj = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    )
    
    with urllib.request.urlopen(request_obj, timeout=30) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    # Parse Z.ai response
    if result and "choices" in result and len(result["choices"]) > 0:
        translated_text = result["choices"][0]["message"]["content"].strip()
        
        return JSONResponse({
            "success": True,
            "translated": translated_text,
            "source_lang": req.source_lang,
            "target_lang": req.target_lang,
            "provider": "zai"
        })
    else:
        raise HTTPException(status_code=500, detail="Z.ai translation failed: Invalid response format")

async def translate_with_google(req: TranslateRequest):
    """Translate using Google Translate API (unofficial)"""
    # Encode text for URL
    text_encoded = urllib.parse.quote(req.text)
    
    # Build Google Translate API URL
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={req.source_lang}&tl={req.target_lang}&dt=t&q={text_encoded}"
    
    # Make request
    with urllib.request.urlopen(url, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    # Parse response
    # Result format: [[[translated, original, ...]], null, source_lang, ...]
    if result and len(result) > 0 and result[0]:
        # Combine all translated segments
        translated_text = "".join([segment[0] for segment in result[0] if segment[0]])
        source_lang = result[2] if len(result) > 2 else "unknown"
        
        return JSONResponse({
            "success": True,
            "translated": translated_text,
            "source_lang": source_lang,
            "target_lang": req.target_lang,
            "provider": "google"
        })
    else:
        raise HTTPException(status_code=500, detail="Google translation failed: Invalid response format")

if __name__ == "__main__":
    import uvicorn
    print("Starting server at http://127.0.0.1:8123")
    uvicorn.run(app, host="127.0.0.1", port=8123)
