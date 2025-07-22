# 🚗 SIM Extractor API

API untuk mengekstrak data dari Surat Izin Mengemudi (SIM) Indonesia menggunakan Gemini AI dan Google Apps Script.

## ✨ Fitur

- 📸 **OCR Otomatis**: Ekstrak data dari gambar SIM menggunakan Gemini AI
- 🔍 **Validasi Dokumen**: Deteksi otomatis apakah dokumen adalah SIM atau bukan
- 📊 **16+ Data Field**: Ekstrak semua informasi penting dari SIM
- 💾 **Penyimpanan Otomatis**: Data tersimpan otomatis ke Google Sheets
- 📝 **Logging Lengkap**: Tracking semua aktivitas API
- 🌐 **RESTful API**: Interface yang mudah digunakan
- 📖 **Self-Documenting**: Dokumentasi API built-in

## 🏗️ Arsitektur

```
Client → Google Apps Script → Gemini AI → Google Sheets + Google Drive
```

## 📋 Data yang Diekstrak

| Field | Deskripsi |
|-------|-----------|
| nomor_sim | Nomor SIM |
| nama | Nama lengkap |
| tempat_tanggal_lahir | Tempat dan tanggal lahir |
| jenis_kelamin | Jenis kelamin |
| golongan_darah | Golongan darah |
| alamat | Alamat lengkap |
| rt_rw | RT/RW |
| desa_kelurahan | Desa/Kelurahan |
| kecamatan | Kecamatan |
| kota | Kota |
| tinggi | Tinggi badan |
| pekerjaan | Pekerjaan |
| golongan_sim | Golongan SIM (A/B/C) |
| berlaku_hingga | Tanggal berlaku |
| dikeluarkan_di | Tempat penerbitan |
| instansi_penerbit | Instansi penerbit |

## 🚀 Quick Start

### 1. Setup Google Cloud
```bash
# Aktifkan Gemini API di Google AI Studio
# Dapatkan API Key dari https://aistudio.google.com/app/apikey
```

### 2. Setup Google Workspace
- Buat Google Spreadsheet baru
- Buat folder di Google Drive
- Copy ID Spreadsheet dan Folder

### 3. Deploy Script
1. Buka [Google Apps Script](https://script.google.com)
2. Buat project baru
3. Paste kode dari `Code.gs`
4. Update konfigurasi:
   ```javascript
   const GEMINI_API_KEY = 'your-gemini-api-key';
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   const FOLDER_ID = 'your-drive-folder-id';
   ```
5. Deploy sebagai web app

### 4. Test API
```bash
curl -X POST "YOUR_SCRIPT_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=process-sim&fileData=BASE64_IMAGE&fileName=sim.jpg&mimeType=image/jpeg"
```

## 📚 Dokumentasi API

### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

### Endpoints

#### GET /
Status check API
```json
{
  "status": "success",
  "message": "API Ekstraksi Data SIM sedang berjalan"
}
```

#### POST / (action=process-sim)
Proses gambar SIM

**Request:**
```json
{
  "action": "process-sim",
  "fileData": "base64_encoded_image",
  "fileName": "sim.jpg",
  "mimeType": "image/jpeg"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/xxx/view",
      "fileName": "sim.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "Raw text dari Gemini AI",
      "parsed": {
        "status": "success",
        "nomor_sim": "1534-8211-001569",
        "nama": "JOHN DOE",
        "tempat_tanggal_lahir": "JAKARTA, 01-01-1990",
        "jenis_kelamin": "PRIA",
        "golongan_darah": "O",
        "alamat": "JL. CONTOH NO. 123",
        "rt_rw": "RT 01 RW 02",
        "desa_kelurahan": "KELURAHAN CONTOH",
        "kecamatan": "KECAMATAN CONTOH",
        "kota": "JAKARTA",
        "tinggi": "170",
        "pekerjaan": "PROGRAMMER",
        "golongan_sim": "C",
        "berlaku_hingga": "01-01-2030",
        "dikeluarkan_di": "JAKARTA",
        "instansi_penerbit": "POLDA METRO JAYA"
      }
    }
  }
}
```

**Response (Not SIM):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "analysis": {
      "parsed": {
        "status": "not_sim",
        "message": "Dokumen yang diberikan bukan merupakan SIM"
      }
    }
  }
}
```

#### POST / (action=docs)
Mendapatkan dokumentasi API
```json
{
  "action": "docs"
}
```

## 🛠️ Konfigurasi

Update konstanta di bagian atas `Code.gs`:

```javascript
const GEMINI_API_KEY = 'your-gemini-api-key';
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = 'your-spreadsheet-id';
const FOLDER_ID = 'your-drive-folder-id';
```

## 📊 Data Storage

### Google Sheets Structure

#### Sheet: `log`
| Timestamp | Action | Message | Level |
|-----------|---------|---------|-------|

#### Sheet: `metadata`  
| Timestamp | FileName | FileID | FileURL | Description | IsSIM |
|-----------|----------|--------|---------|-------------|-------|

#### Sheet: `data_sim`
| Timestamp | File Name | Nomor SIM | Nama | ... | (16 fields) |
|-----------|-----------|-----------|------|-----|-------------|

## 🔧 Development

### Local Testing
```javascript
// Test function di Apps Script Editor
function testProcessImage() {
  const testData = {
    fileData: 'base64_image_data',
    fileName: 'test.jpg', 
    mimeType: 'image/jpeg'
  };
  
  const result = processSIMAPI(testData);
  console.log(result);
}
```

### Error Handling
API mengembalikan error codes:
- `400`: Bad Request (parameter hilang/salah)
- `500`: Server Error (Gemini API error, etc)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Gemini AI](https://ai.google.dev/) untuk OCR capabilities
- [Google Apps Script](https://script.google.com/) untuk hosting
- [Google Workspace](https://workspace.google.com/) untuk storage

## 📞 Support

Jika ada pertanyaan atau issue:
- 📧 Email: kontak@classy.id

---

⭐ **Star repository ini jika bermanfaat!**
