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
- `Ctrl+H` - Toggle toolbar visibility (hide/show)

### 🎨 Visual Indicators

- **Biru gradient (sky blue)** = Teks sudah diterjemahkan
- **Kuning gradient** = Teks original (setelah toggle)
- **Hover** = Tampilkan tooltip "🔄 Click to toggle" + subtle lift effect
- **🌐 Button** = Floating button untuk show/hide toolbar

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

#### Desktop:
1. **Translate Paragraf Panjang**: Pilih seluruh paragraf → Translate
2. **Translate Satu Kata**: Pilih kata → Translate
3. **Bandingkan Terjemahan**: Klik pada teks yang diterjemahkan untuk toggle bolak-balik
4. **Translate Cepat**: Gunakan `Ctrl+Shift+T` setelah memilih teks
5. **Translate Halaman**: Untuk membaca full chapter dalam bahasa lain
6. **Hide Toolbar**: Klik tombol ✕ atau tekan `Ctrl+H` untuk fokus membaca
7. **Show Toolbar**: Klik tombol 🌐 floating atau tekan `Ctrl+H` lagi

#### Mobile:
1. **Toggle Sidebar**: Tap tombol ☰ di kanan atas untuk hide/show TOC
2. **Toolbar di Bottom**: Toolbar translate ada di bawah, mudah dijangkau
3. **Select Text**: Long press pada text untuk select, lalu tap "Select Text" button
4. **Quick Translate**: Tap "📄 Page" untuk translate seluruh halaman
5. **Floating Button**: Tombol 🌐 di kanan bawah untuk show/hide toolbar
6. **Portrait & Landscape**: Support kedua orientasi

### 🎯 Cara Kerja Toggle

Setiap teks yang diterjemahkan disimpan dengan data attributes:
- `data-original` = Teks asli
- `data-translated` = Teks terjemahan
- `data-state` = Status saat ini (original/translated)

Klik untuk switch antara keduanya!

### 🌐 Translation API

Aplikasi ini mendukung **2 Provider Translasi**:

#### 1. 🤖 Z.ai API (GLM-4.5-flash)
- Menggunakan AI model yang canggih
- Terjemahan lebih natural dan kontekstual
- Memerlukan API key

**Konfigurasi:**
1. Buat file `.env` di root folder project
2. Tambahkan credentials:
   ```
   ZAI_API_KEY=your_api_key_here
   ZAI_API_URL=https://api.z.ai/api/paas/v4/chat/completions
   ZAI_MODEL=glm-4.5-flash
   ```

#### 2. 🌐 Google Translate
- Free API (tidak perlu konfigurasi)
- Cepat dan reliable
- Rate limiting mungkin berlaku

**Cara Memilih Provider:**
- Di toolbar translate, pilih provider dari dropdown:
  - **🤖 Z.ai** - Untuk terjemahan AI yang lebih akurat
  - **🌐 Google** - Untuk terjemahan cepat tanpa setup

### 📝 Changelog

**v3.5** (23 Nov 2025)
- ✅ **Dual Provider Support** - Pilih antara Z.ai atau Google Translate
- ✅ Provider selector di toolbar
- ✅ Emoji indicators untuk setiap provider
- ✅ Fleksibel: AI translation atau free translation

**v3.4** (23 Nov 2025)
- ✅ **Z.ai API Integration** - Menggunakan GLM-4.5-flash model
- ✅ Environment variables dengan .env file
- ✅ Terjemahan lebih natural dan akurat
- ✅ Support 14+ bahasa

**v3.3** (23 Nov 2025)
- ✅ **Full Mobile Responsive** - Perfect untuk smartphone & tablet
- ✅ Mobile toolbar di bottom (mudah dijangkau)
- ✅ Collapsible sidebar untuk mobile
- ✅ Touch-friendly buttons (min 44px)
- ✅ Premium library design dengan gradient
- ✅ Adaptive layout untuk semua screen sizes

**v3.2** (23 Nov 2025)
- ✅ Hide/Show toolbar dengan floating button 🌐
- ✅ Warna highlight premium (sky blue gradient)
- ✅ Smooth animations & transitions
- ✅ Persistent state (localStorage)
- ✅ Better hover effects
- ✅ Ctrl+H shortcut untuk toggle toolbar

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

**Dibuat dengan ❤️ menggunakan FastAPI, Jinja2, Z.ai API, dan Google Translate**

