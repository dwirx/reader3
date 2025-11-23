# 📚 Reader3 - EPUB Reader dengan Fitur Translate

## ✨ Fitur Baru: In-Place Translation

### 🎯 Fitur Utama

1. **Translate Teks yang Dipilih**
   - Pilih teks apa saja di halaman
   - Klik tombol "🌐 Translate" atau tekan `Ctrl+Shift+T`
   - Teks akan langsung diganti dengan terjemahan

2. **Translate Seluruh Halaman**
   - Klik tombol "📄 Translate Page"
   - Semua paragraf dan heading akan diterjemahkan otomatis
   - Progress ditampilkan real-time

3. **Toggle Original/Translated**
   - **Klik pada teks yang sudah diterjemahkan** untuk toggle antara bahasa original dan terjemahan
   - Warna kuning = terjemahan
   - Warna biru = original
   - Hover untuk melihat hint

4. **Multi-bahasa Support**
   - 🇮🇩 Indonesia
   - 🇬🇧 English
   - 🇨🇳 Chinese
   - 🇯🇵 Japanese
   - 🇰🇷 Korean
   - 🇸🇦 Arabic
   - 🇪🇸 Spanish
   - 🇫🇷 French
   - 🇩🇪 German
   - 🇷🇺 Russian
   - 🇵🇹 Portuguese
   - 🇮🇹 Italian
   - 🇹🇭 Thai
   - 🇻🇳 Vietnamese

### ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+T` - Translate selected text
- `Alt+Z` - Undo last translation

### 🎨 Visual Indicators

- **Kuning dengan garis putus-putus** = Teks sudah diterjemahkan
- **Biru dengan garis putus-putus** = Teks original (setelah toggle)
- **Hover** = Tampilkan tooltip "🔄 Click to toggle"

### 🚀 Menjalankan Server

```bash
# Dengan uv (recommended)
uv run server.py

# Atau dengan python langsung
python3 server.py
```

Server akan berjalan di: **http://127.0.0.1:8123**

### 📁 Struktur File (Modular)

```
reader3/
├── server.py              # Backend API (FastAPI)
├── reader3.py             # EPUB processor
├── templates/
│   ├── library.html       # Library view
│   └── reader.html        # Reader interface (clean!)
├── static/
│   ├── reader.css         # All styles (modular)
│   └── reader.js          # All JavaScript (modular)
└── brandon_data/          # Processed books
```

### 🔧 API Endpoint

**POST `/api/translate`**

Request:
```json
{
  "text": "Hello World",
  "target_lang": "id",
  "source_lang": "auto"
}
```

Response:
```json
{
  "success": true,
  "translated": "Halo Dunia",
  "source_lang": "en",
  "target_lang": "id"
}
```

### 💡 Tips Penggunaan

1. **Translate Paragraf Panjang**: Pilih seluruh paragraf → Translate
2. **Translate Satu Kata**: Pilih kata → Translate
3. **Bandingkan Terjemahan**: Klik pada teks yang diterjemahkan untuk toggle bolak-balik
4. **Translate Cepat**: Gunakan `Ctrl+Shift+T` setelah memilih teks
5. **Translate Halaman**: Untuk membaca full chapter dalam bahasa lain

### 🎯 Cara Kerja Toggle

Setiap teks yang diterjemahkan disimpan dengan data attributes:
- `data-original` = Teks asli
- `data-translated` = Teks terjemahan
- `data-state` = Status saat ini (original/translated)

Klik untuk switch antara keduanya!

### 🌐 Translation API

Menggunakan Google Translate API (unofficial):
```
https://translate.googleapis.com/translate_a/single
```

**Note**: Free API dengan rate limiting. Untuk production, gunakan official Google Translate API.

### 📝 Changelog

**v3.1** (23 Nov 2025)
- ✅ Refactor ke struktur modular (CSS & JS terpisah)
- ✅ In-place translation (replace text langsung)
- ✅ Toggle antara original dan translated
- ✅ Translate full page
- ✅ Warna highlight yang lebih baik
- ✅ Keyboard shortcuts
- ✅ Progress indicator
- ✅ Auto-detect source language

---

**Dibuat dengan ❤️ menggunakan FastAPI, Jinja2, dan Google Translate API**

