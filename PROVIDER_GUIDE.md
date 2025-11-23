# 🎯 Panduan Memilih Provider Translation

## 📊 Perbandingan Provider

| Fitur | 🤖 Z.ai | 🌐 Google Translate |
|-------|---------|---------------------|
| **Setup** | Perlu API key di `.env` | Tidak perlu setup |
| **Kecepatan** | Sedang (AI processing) | Cepat |
| **Kualitas** | Sangat baik (kontekstual) | Baik (literal) |
| **Biaya** | Tergantung plan Z.ai | Gratis (ada rate limit) |
| **Bahasa** | 14+ bahasa | 100+ bahasa |
| **Context-aware** | ✅ Ya | ❌ Tidak |
| **Rate Limiting** | Tergantung plan | Ada (unofficial API) |

## 🚀 Cara Menggunakan

### 1. Setup Z.ai (Opsional)

Jika ingin menggunakan Z.ai:

```bash
# Buat file .env di root folder
cd /home/hades/FUN/reader3

# Tambahkan API key
echo 'ZAI_API_KEY=your_api_key_here' >> .env
echo 'ZAI_API_URL=https://api.z.ai/api/paas/v4/chat/completions' >> .env
echo 'ZAI_MODEL=glm-4.5-flash' >> .env
```

### 2. Jalankan Server

```bash
uv run server.py
```

Server akan berjalan di: http://127.0.0.1:8123

### 3. Pilih Provider di UI

1. Buka reader (http://127.0.0.1:8123)
2. Di toolbar translate, pilih provider:
   - **🤖 Z.ai** - AI translation
   - **🌐 Google** - Free translation
3. Pilih bahasa target
4. Translate!

## 💡 Kapan Menggunakan Masing-Masing?

### Gunakan 🤖 Z.ai Ketika:
- ✅ Butuh terjemahan yang sangat natural
- ✅ Translate teks literary/sastra
- ✅ Konteks penting (idiom, ungkapan)
- ✅ Terjemahan untuk publikasi
- ✅ Punya API key Z.ai

### Gunakan 🌐 Google Translate Ketika:
- ✅ Ingin translate cepat
- ✅ Tidak punya API key
- ✅ Terjemahan casual/quick read
- ✅ Rate limit Z.ai habis
- ✅ Bahasa jarang (Google support lebih banyak)

## 🧪 Testing API

### Test Z.ai:
```bash
curl -X POST "http://127.0.0.1:8123/api/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "target_lang": "id",
    "provider": "zai"
  }'
```

### Test Google:
```bash
curl -X POST "http://127.0.0.1:8123/api/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "target_lang": "id",
    "provider": "google"
  }'
```

## 🔧 Troubleshooting

### Z.ai tidak bekerja?
1. Cek file `.env` sudah ada dan benar
2. Cek API key masih valid
3. Cek quota API key
4. Restart server setelah update `.env`

### Google Translate lambat/error?
1. Rate limiting - tunggu beberapa detik
2. Gunakan delay antara translate (sudah otomatis)
3. Switch ke Z.ai jika Google down

## 📈 Best Practices

1. **Translate selektif**: Jangan translate semua halaman sekaligus
2. **Campurkan provider**: Gunakan Google untuk quick scan, Z.ai untuk detail
3. **Save quota**: Gunakan Google untuk testing, Z.ai untuk final
4. **Bahasa default**: Set provider default sesuai kebutuhan (edit JS)

## 🎨 Customization

### Ganti Provider Default

Edit `reader.html` line ~73:

```html
<select class="provider-select" id="providerSelect" title="Translation Provider">
    <option value="zai">🤖 Z.ai</option>
    <option value="google" selected>🌐 Google</option>  <!-- Add 'selected' -->
</select>
```

### Tambah Provider Baru

1. Tambahkan function di `server.py`:
   ```python
   async def translate_with_newprovider(req: TranslateRequest):
       # Implementation
   ```

2. Update routing di `translate_text()`
3. Tambahkan option di HTML
4. Update JS untuk handle new provider

---

**Happy Reading & Translating! 📚✨**

