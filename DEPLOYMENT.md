# 🚀 Panduan Deployment SIM Extractor API

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:
- ✅ Akun Google (Gmail)
- ✅ Akses ke Google Drive dan Google Sheets
- ✅ Akun Google AI Studio untuk Gemini API

---

## Step 1: Setup Gemini AI API

### 1.1 Dapatkan API Key
1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik **"Create API Key"**
4. Pilih project atau buat project baru
5. Copy dan simpan API Key yang dihasilkan

⚠️ **Penting**: Jangan share API key Anda ke siapapun!

### 1.2 Test API Key
```bash
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello World"}]}]}' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY'
```

---

## Step 2: Setup Google Workspace

### 2.1 Buat Google Spreadsheet
1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"+ Blank"** untuk sheet baru
3. Rename sheet menjadi **"SIM Extractor Database"**
4. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/xx/edit
   ```
   ID = `xx`

### 2.2 Buat Google Drive Folder
1. Buka [Google Drive](https://drive.google.com)
2. Klik **"+ New"** → **"Folder"**
3. Beri nama **"SIM Images"**
4. Klik kanan folder → **"Share"**
5. Set permission ke **"Anyone with the link can view"**
6. Copy **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/xx
   ```
   ID = `xx`

---

## Step 3: Deploy Google Apps Script

### 3.1 Buat Apps Script Project
1. Buka [Google Apps Script](https://script.google.com)
2. Klik **"+ New Project"**
3. Rename project menjadi **"SIM Extractor API"**

### 3.2 Setup Script
1. Hapus kode default di `Code.gs`
2. Copy-paste seluruh kode dari file yang telah disediakan
3. Update konfigurasi di bagian atas:
   ```javascript
   // Config
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   const GEMINI_MODEL = 'gemini-2.0-flash';
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   const LOG_SHEET_NAME = 'log';
   const METADATA_SHEET_NAME = 'metadata';
   const TRANSACTIONS_SHEET_NAME = 'data_sim';
   const FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';
   ```

### 3.3 Set Permissions
1. Klik ikon **"Services"** (⚙️) di sidebar kiri
2. Tambahkan services berikut jika belum ada:
   - Drive API
   - Sheets API
3. Atau langsung save script (permissions akan diminta otomatis)

### 3.4 Deploy sebagai Web App
1. Klik **"Deploy"** → **"New deployment"**
2. Klik ikon gear (⚙️) dan pilih **"Web app"**
3. Isi konfigurasi:
   - **Description**: `SIM Extractor API v1.0`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (untuk public API)
4. Klik **"Deploy"**
5. **Authorize** permissions yang diminta
6. Copy **Web app URL** yang dihasilkan

### 3.5 Test Deployment
```bash
curl "YOUR_WEB_APP_URL"
```

Response yang diharapkan:
```json
{
  "status": "success",
  "message": "API Ekstraksi Data SIM sedang berjalan. Gunakan metode POST untuk menganalisis SIM."
}
```

---

## Step 4: Test API

### 4.1 Persiapkan Test Image
- Siapkan gambar SIM format JPG/PNG
- Pastikan gambar jelas dan readable
- Convert ke base64 (gunakan online converter atau script)

### 4.2 Test API Call
```bash
# Test dengan curl
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=process-sim" \
  -d "fileData=BASE64_IMAGE_DATA" \
  -d "fileName=test_sim.jpg" \
  -d "mimeType=image/jpeg"
```

### 4.3 Verify Data Storage
1. Cek Google Sheets - akan terbuat 3 sheets otomatis:
   - `log`: Activity logs
   - `metadata`: File metadata
   - `data_sim`: Extracted SIM data

2. Cek Google Drive folder - gambar tersimpan otomatis

---

## Step 5: Production Setup

### 5.1 Custom Domain (Opsional)
Untuk production, gunakan custom domain:
1. Setup reverse proxy (Nginx/Cloudflare)
2. Route ke Apps Script URL
3. Setup SSL certificate

### 5.2 Rate Limiting
Implementasi rate limiting di level aplikasi:
```javascript
// Tambahkan di awal function doPost
const userKey = getUserKey(e); // Implement user identification
if (isRateLimited(userKey)) {
  return errorResponse(429, 'Rate limit exceeded');
}
```

### 5.3 Monitoring & Alerting
1. Setup Google Cloud Monitoring
2. Monitor quota usage
3. Setup alerting untuk errors

### 5.4 Backup Strategy
1. **Automatic Backup**: Apps Script tersimpan otomatis di Google Drive
2. **Manual Backup**: Export script secara berkala
3. **Data Backup**: Setup scheduled export untuk Sheets data

---

## Step 6: Security Considerations

### 6.1 API Key Security
```javascript
// Jangan hardcode API key di script
// Gunakan PropertiesService untuk production
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
```

Setup properties:
1. Di Apps Script Editor, klik **"Project Settings"** (⚙️)
2. Scroll ke **"Script Properties"**
3. Klik **"Add script property"**
4. Add properties:
   - Key: `GEMINI_API_KEY`, Value: `your_api_key`
   - Key: `SPREADSHEET_ID`, Value: `your_spreadsheet_id`
   - Key: `FOLDER_ID`, Value: `your_folder_id`

### 6.2 Input Validation
```javascript
// Tambahkan validasi yang lebih ketat
function validateInput(data) {
  // Check file size (max 20MB)
  if (data.fileData.length > 20 * 1024 * 1024 * 4/3) {
    throw new Error('File too large');
  }
  
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(data.mimeType)) {
    throw new Error('Unsupported file type');
  }
}
```

### 6.3 Access Control
```javascript
// Implementasi whitelist domain jika diperlukan
function checkOrigin(e) {
  const allowedDomains = ['yourdomain.com', 'localhost'];
  const origin = e.parameter.origin;
  
  if (origin && !allowedDomains.includes(origin)) {
    throw new Error('Unauthorized domain');
  }
}
```

---

## Step 7: Troubleshooting

### 7.1 Common Issues

#### Issue: "Script function not found"
**Solution:**
1. Pastikan function name benar
2. Re-deploy script
3. Clear browser cache

#### Issue: "Authorization required"
**Solution:**
1. Klik **"Review Permissions"** di Apps Script
2. Allow semua permissions yang diminta
3. Re-deploy web app

#### Issue: "Gemini API error 429"
**Solution:**
1. Cek quota di Google AI Studio
2. Implementasi retry logic
3. Upgrade ke paid tier jika diperlukan

#### Issue: "Drive/Sheets permission denied"
**Solution:**
1. Pastikan script memiliki akses ke Drive/Sheets
2. Cek ownership file Sheets/Drive folder
3. Re-authorize permissions

### 7.2 Debug Tips

#### Enable Debug Logging
```javascript
// Tambahkan di function processImage
console.log('Processing image:', fileName);
console.log('File size:', fileData.length);
console.log('MIME type:', mimeType);
```

#### View Logs
1. Di Apps Script Editor: **"Executions"** tab
2. Klik execution untuk detail logs
3. Check error stack trace

#### Test Individual Functions
```javascript
// Test function di Apps Script Editor
function testGeminiAPI() {
  const testRequest = {
    contents: [{
      parts: [{ text: "Hello, test connection" }]
    }]
  };
  
  const response = callGeminiAPI(testRequest);
  console.log('Gemini response:', response);
}
```

---

## Step 8: Performance Optimization

### 8.1 Caching Strategy
```javascript
// Cache hasil OCR untuk gambar yang sama
const cache = CacheService.getScriptCache();

function getCachedResult(fileHash) {
  return cache.get(fileHash);
}

function setCachedResult(fileHash, result) {
  // Cache for 1 hour
  cache.put(fileHash, JSON.stringify(result), 3600);
}
```

### 8.2 Batch Processing
```javascript
// Untuk multiple files
function processBatchSIM(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const result = processImage(file.fileData, file.fileName, file.mimeType);
      results.push(result);
    } catch (error) {
      results.push({ success: false, error: error.toString() });
    }
  }
  
  return results;
}
```

### 8.3 Async Processing
```javascript
// Untuk file besar, proses async
function processImageAsync(fileData, fileName, mimeType) {
  // Queue job untuk background processing
  const jobId = Utilities.getUuid();
  
  // Store job status
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(`job_${jobId}`, 'processing');
  
  // Process in background (trigger-based)
  ScriptApp.newTrigger('processImageBackground')
    .timeBased()
    .after(1000) // 1 second delay
    .create();
    
  return { jobId: jobId, status: 'queued' };
}
```

---

## Step 9: Monitoring & Analytics

### 9.1 Usage Analytics
```javascript
// Track API usage
function trackUsage(action, success, processingTime) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const analyticsSheet = spreadsheet.getSheetByName('analytics') || 
                        spreadsheet.insertSheet('analytics');
  
  if (analyticsSheet.getLastRow() === 0) {
    analyticsSheet.appendRow([
      'Timestamp', 'Action', 'Success', 'ProcessingTime', 'UserAgent'
    ]);
  }
  
  analyticsSheet.appendRow([
    new Date().toISOString(),
    action,
    success,
    processingTime,
    // e.parameter could contain user agent info
  ]);
}
```

### 9.2 Error Monitoring
```javascript
// Setup error alerts
function sendErrorAlert(error) {
  // Send email alert untuk critical errors
  if (error.includes('Quota exceeded') || error.includes('API error')) {
    GmailApp.sendEmail(
      'admin@yourdomain.com',
      'SIM Extractor API Error',
      `Error occurred: ${error}\nTime: ${new Date().toISOString()}`
    );
  }
}
```

### 9.3 Health Check Endpoint
```javascript
// Tambahkan health check
function healthCheck() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      gemini_api: false,
      drive_access: false,
      sheets_access: false
    }
  };
  
  try {
    // Test Gemini API
    callGeminiAPI({ contents: [{ parts: [{ text: "test" }] }] });
    health.checks.gemini_api = true;
  } catch (e) {
    health.status = 'degraded';
  }
  
  try {
    // Test Drive access
    DriveApp.getFolderById(FOLDER_ID);
    health.checks.drive_access = true;
  } catch (e) {
    health.status = 'degraded';
  }
  
  try {
    // Test Sheets access
    SpreadsheetApp.openById(SPREADSHEET_ID);
    health.checks.sheets_access = true;
  } catch (e) {
    health.status = 'degraded';
  }
  
  return health;
}
```

---

## Step 10: Maintenance

### 10.1 Regular Updates
1. **Monthly**: Update Gemini API model jika ada versi baru
2. **Quarterly**: Review dan clean up old logs
3. **Yearly**: Review security dan permissions

### 10.2 Data Cleanup
```javascript
// Cleanup old data (run monthly)
function cleanupOldData() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Keep 3 months
  
  // Delete rows older than cutoff date
  // Implementation depends on your retention policy
}
```

### 10.3 Backup Script
```javascript
// Backup critical data weekly
function backupData() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const backupFolder = DriveApp.createFolder(`Backup_${new Date().toISOString().split('T')[0]}`);
  
  // Create backup copy
  const backupSpreadsheet = spreadsheet.copy(`SIM_Backup_${Date.now()}`);
  DriveApp.getFileById(backupSpreadsheet.getId()).moveTo(backupFolder);
}
```

---

## Kesimpulan

Setelah mengikuti semua langkah di atas, Anda akan memiliki:

✅ **Fully functional SIM Extractor API**  
✅ **Automatic data storage & logging**  
✅ **Production-ready deployment**  
✅ **Security best practices**  
✅ **Monitoring & analytics**  
✅ **Maintenance procedures**

### Next Steps
1. Test API dengan berbagai jenis SIM
2. Implementasi rate limiting untuk production
3. Setup custom domain jika diperlukan
4. Monitor usage dan optimize performance
5. Scale infrastructure sesuai kebutuhan

### Support
Jika mengalami masalah selama deployment:
- Check troubleshooting section di atas
- Review Apps Script execution logs
- Verify all permissions dan configurations
- Test individual components (Gemini API, Drive, Sheets)

**Good luck dengan deployment! 🚀**
