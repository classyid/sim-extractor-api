# 📋 SIM Extractor API Documentation

## Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

## Authentication
Tidak diperlukan authentication untuk public API.

## Content Types
- Request: `application/x-www-form-urlencoded` atau `application/json`
- Response: `application/json`

---

## Endpoints

### 1. Health Check
**GET** `/`

Mengecek status API.

#### Response
```json
{
  "status": "success",
  "message": "API Ekstraksi Data SIM sedang berjalan. Gunakan metode POST untuk menganalisis SIM.",
  "documentation": "Kirim parameter \"action=docs\" untuk mendapatkan dokumentasi"
}
```

---

### 2. Process SIM Image
**POST** `/`

Mengekstrak data dari gambar SIM Indonesia.

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ✅ | Harus berisi `"process-sim"` |
| `fileData` | string | ✅ | Gambar yang di-encode dalam base64 |
| `fileName` | string | ✅ | Nama file (contoh: `sim.jpg`) |
| `mimeType` | string | ✅ | MIME type gambar (`image/jpeg`, `image/png`) |

#### Example Request (Form Data)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=process-sim" \
  -d "fileData=iVBORw0KGgoAAAANSUhEUgAA..." \
  -d "fileName=sim.jpg" \
  -d "mimeType=image/jpeg"
```

#### Example Request (JSON)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "process-sim",
    "fileData": "iVBORw0KGgoAAAANSUhEUgAA...",
    "fileName": "sim.jpg",
    "mimeType": "image/jpeg"
  }'
```

#### Success Response (SIM Detected)
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1ABC123.../view",
      "fileName": "sim.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "Nomor SIM: xx9\nNama: xx\n...",
      "parsed": {
        "status": "success",
        "nomor_sim": "xx",
        "nama": "xx",
        "tempat_tanggal_lahir": "xx",
        "jenis_kelamin": "xx",
        "golongan_darah": "A",
        "alamat": "xx",
        "rt_rw": xx6",
        "desa_kelurahan": "",
        "kecamatan": "",
        "kota": "xx",
        "tinggi": "",
        "pekerjaan": "xx",
        "golongan_sim": "xx",
        "berlaku_hingga": "xx",
        "dikeluarkan_di": "xx",
        "instansi_penerbit": ""
      }
    }
  }
}
```

#### Success Response (Not SIM)
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1ABC123.../view",
      "fileName": "not_sim.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "Dokumen ini bukan SIM",
      "parsed": {
        "status": "not_sim",
        "message": "Dokumen yang diberikan bukan merupakan SIM"
      }
    }
  }
}
```

---

### 3. Get API Documentation
**POST** `/`

Mendapatkan dokumentasi API dalam format JSON.

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ✅ | Harus berisi `"docs"` |

#### Example Request
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=docs"
```

#### Response
```json
{
  "api_name": "API Ekstraksi Data SIM",
  "version": "1.0.0",
  "description": "API untuk menganalisis dan mengekstrak data dari Surat Izin Mengemudi (SIM) Indonesia menggunakan Gemini AI",
  "base_url": "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  "endpoints": [...],
  "examples": {...}
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan",
  "code": 400
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "API error: 429 - Quota exceeded",
  "code": 500
}
```

---

## Data Fields

### Extracted SIM Data
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `nomor_sim` | string | Nomor SIM | "xx" |
| `nama` | string | Nama lengkap | "xx" |
| `tempat_tanggal_lahir` | string | Tempat, tanggal lahir | "xx" |
| `jenis_kelamin` | string | Jenis kelamin | "PRIA" / "WANITA" |
| `golongan_darah` | string | Golongan darah | "A", "B", "AB", "O" |
| `alamat` | string | Alamat lengkap | "xx" |
| `rt_rw` | string | RT/RW | "xx" |
| `desa_kelurahan` | string | Desa/Kelurahan | "KELURAHAN CONTOH" |
| `kecamatan` | string | Kecamatan | "KECAMATAN CONTOH" |
| `kota` | string | Kota | "xx" |
| `tinggi` | string | Tinggi badan (cm) | "xx" |
| `pekerjaan` | string | Pekerjaan | "xx" |
| `golongan_sim` | string | Golongan SIM | "A", "B", "C", "D" |
| `berlaku_hingga` | string | Tanggal berlaku | "xx7" |
| `dikeluarkan_di` | string | Tempat penerbitan | "xx" |
| `instansi_penerbit` | string | Instansi penerbit | "xx" |

---

## Rate Limits
- Gemini API: 60 requests/minute
- Google Apps Script: 20,000 URL fetch calls/day
- Google Drive: 1000 files/day

## Supported Image Formats
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- Maximum file size: 20MB

## Best Practices

### Image Quality
- Gunakan gambar dengan resolusi minimal 800x600
- Pastikan teks terlihat jelas dan tidak blur
- Hindari bayangan atau refleksi pada SIM
- Foto dengan pencahayaan yang cukup

### Error Handling
```javascript
fetch(apiUrl, {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.status === 'success') {
    if (data.data.analysis.parsed.status === 'success') {
      // SIM berhasil diproses
      console.log('SIM Data:', data.data.analysis.parsed);
    } else {
      // Dokumen bukan SIM
      console.log('Not a SIM document');
    }
  } else {
    // Error
    console.error('API Error:', data.message);
  }
})
.catch(error => {
  console.error('Network Error:', error);
});
```

### Base64 Encoding
```javascript
// Browser
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Node.js
const fs = require('fs');
const base64Data = fs.readFileSync('sim.jpg', { encoding: 'base64' });
```

---

## SDKs and Examples

### JavaScript/Browser
```html
<!DOCTYPE html>
<html>
<head>
    <title>SIM Extractor</title>
</head>
<body>
    <input type="file" id="fileInput" accept="image/*">
    <button onclick="processSIM()">Extract SIM Data</button>
    
    <script>
        async function processSIM() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            const base64 = await fileToBase64(file);
            
            const formData = new FormData();
            formData.append('action', 'process-sim');
            formData.append('fileData', base64);
            formData.append('fileName', file.name);
            formData.append('mimeType', file.type);
            
            try {
                const response = await fetch('YOUR_API_URL', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                console.log('Result:', result);
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });
        }
    </script>
</body>
</html>
```

### Python
```python
import requests
import base64

def process_sim(api_url, image_path):
    # Read and encode image
    with open(image_path, 'rb') as img_file:
        img_data = base64.b64encode(img_file.read()).decode('utf-8')
    
    # Prepare payload
    payload = {
        'action': 'process-sim',
        'fileData': img_data,
        'fileName': 'sim.jpg',
        'mimeType': 'image/jpeg'
    }
    
    # Make request
    response = requests.post(api_url, data=payload)
    result = response.json()
    
    return result

# Usage
api_url = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
result = process_sim(api_url, 'sim.jpg')
print(result)
```

### PHP
```php
<?php
function processSIM($apiUrl, $imagePath) {
    $imageData = base64_encode(file_get_contents($imagePath));
    
    $postData = [
        'action' => 'process-sim',
        'fileData' => $imageData,
        'fileName' => basename($imagePath),
        'mimeType' => mime_content_type($imagePath)
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
$result = processSIM($apiUrl, 'sim.jpg');
print_r($result);
?>
```
