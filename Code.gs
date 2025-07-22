// Config
const GEMINI_API_KEY = '<APIKEY-GEMINI>';
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = '<SPREADSHEET-ID>';
const LOG_SHEET_NAME = 'log';
const METADATA_SHEET_NAME = 'metadata';
const TRANSACTIONS_SHEET_NAME = 'data_sim';
const FOLDER_ID = '<FOLDER-ID>';

// Prompt template untuk parsing Surat Izin Mengemudi
const PROMPT_TEMPLATE = `<prompt bisa dicheckout https://lynk.id/classyid>`;

/**
 * Handle GET requests - Return API status
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API Ekstraksi Data SIM sedang berjalan. Gunakan metode POST untuk menganalisis SIM.',
    documentation: 'Kirim parameter "action=docs" untuk mendapatkan dokumentasi'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('');
}

/**
 * Handle POST requests - Process image and return JSON response
 */
function doPost(e) {
  try {
    // Get parameters from form data or JSON
    let data;
    
    if (e.postData && e.postData.contents) {
      try {
        // Try parsing as JSON first
        data = JSON.parse(e.postData.contents);
      } catch (error) {
        // If not JSON, fall back to form parameters
        data = e.parameter;
      }
    } else {
      // Use form parameters directly
      data = e.parameter;
    }
    
    // Check if action is provided
    if (!data.action) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Parameter wajib tidak ada: action',
        code: 400
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle different API actions
    let result;
    
    switch(data.action) {
      case 'process-sim':
        result = processSIMAPI(data);
        break;
      case 'docs':
        result = getApiDocumentation();
        break;
      default:
        result = {
          status: 'error',
          message: `Action tidak dikenal: ${data.action}`,
          code: 400
        };
    }
    
    // Return result
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logAction('API Error', `Error di endpoint API: ${error.toString()}`, 'ERROR');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString(),
      code: 500
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API endpoint to process SIM
 */
function processSIMAPI(data) {
  try {
    // Validate required parameters
    if (!data.fileData || !data.fileName || !data.mimeType) {
      return {
        status: 'error',
        message: 'Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan',
        code: 400
      };
    }
    
    // Log the request 
    logAction('Request', 'Permintaan pemrosesan SIM diterima', 'INFO');
    
    // Process the SIM image
    const result = processImage(data.fileData, data.fileName, data.mimeType);
    
    // If successful, structure the response
    if (result.success) {
      // Check if the image was not a SIM
      if (result.description === "Dokumen ini bukan SIM") {
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'not_sim',
                message: 'Dokumen yang diberikan bukan merupakan SIM'
              }
            }
          }
        };
      } else {
        // Parse SIM data into structured format
        const simData = parseSIMData(result.description);
        
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'success',
                nomor_sim: simData.nomor_sim,
                nama: simData.nama,
                tempat_tanggal_lahir: simData.tempat_tanggal_lahir,
                jenis_kelamin: simData.jenis_kelamin,
                golongan_darah: simData.golongan_darah,
                alamat: simData.alamat,
                rt_rw: simData.rt_rw,
                desa_kelurahan: simData.desa_kelurahan,
                kecamatan: simData.kecamatan,
                kota: simData.kota,
                tinggi: simData.tinggi,
                pekerjaan: simData.pekerjaan,
                golongan_sim: simData.golongan_sim,
                berlaku_hingga: simData.berlaku_hingga,
                dikeluarkan_di: simData.dikeluarkan_di,
                instansi_penerbit: simData.instansi_penerbit
              }
            }
          }
        };
      }
    } else {
      return {
        status: 'error',
        message: result.error,
        code: 500
      };
    }
  } catch (error) {
    logAction('API Error', `Error in processSIMAPI: ${error.toString()}`, 'ERROR');
    return {
      status: 'error',
      message: error.toString(),
      code: 500
    };
  }
}

/**
 * Return API documentation in JSON format
 */
function getApiDocumentation() {
  const docs = {
    api_name: "API Ekstraksi Data SIM",
    version: "1.0.0",
    description: "API untuk menganalisis dan mengekstrak data dari Surat Izin Mengemudi (SIM) Indonesia menggunakan Gemini AI",
    base_url: ScriptApp.getService().getUrl(),
    endpoints: [
      {
        path: "/",
        method: "GET",
        description: "Pemeriksaan status API",
        parameters: {}
      },
      {
        path: "/",
        method: "POST",
        description: "Proses gambar SIM dan ekstrak datanya",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "process-sim"
          }
        },
        body: {
          type: "application/x-www-form-urlencoded atau application/json",
          required: true,
          schema: {
            fileData: {
              type: "string (base64)",
              required: true,
              description: "Data gambar SIM yang di-encode dalam format base64"
            },
            fileName: {
              type: "string",
              required: true,
              description: "Nama file"
            },
            mimeType: {
              type: "string",
              required: true,
              description: "MIME type dari gambar (e.g., image/jpeg, image/png)"
            }
          }
        },
        responses: {
          "200": {
            description: "Operasi berhasil",
            schema: {
              status: "success",
              code: 200,
              data: {
                original: {
                  fileUrl: "URL ke file yang disimpan di Google Drive",
                  fileName: "Nama file yang diunggah",
                  mimeType: "MIME type dari file"
                },
                analysis: {
                  raw: "Deskripsi mentah dari Gemini AI",
                  parsed: {
                    status: "success atau not_sim",
                    nomor_sim: "Nomor SIM",
                    nama: "Nama lengkap",
                    tempat_tanggal_lahir: "Tempat dan tanggal lahir",
                    jenis_kelamin: "Jenis kelamin",
                    golongan_darah: "Golongan darah",
                    alamat: "Alamat lengkap",
                    rt_rw: "RT/RW",
                    desa_kelurahan: "Desa/Kelurahan",
                    kecamatan: "Kecamatan",
                    kota: "Kota",
                    tinggi: "Tinggi",
                    pekerjaan: "Pekerjaan",
                    golongan_sim: "Golongan SIM",
                    berlaku_hingga: "Berlaku hingga",
                    dikeluarkan_di: "Tempat dan tanggal dikeluarkan",
                    instansi_penerbit: "Instansi penerbit"
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request",
            schema: {
              status: "error",
              message: "Detail error",
              code: 400
            }
          },
          "500": {
            description: "Server error",
            schema: {
              status: "error",
              message: "Detail error",
              code: 500
            }
          }
        }
      },
      {
        path: "/",
        method: "POST",
        description: "Dapatkan dokumentasi API",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "docs"
          }
        },
        responses: {
          "200": {
            description: "Dokumentasi API",
            schema: "Objek dokumentasi ini"
          }
        }
      }
    ],
    examples: {
      "process-sim": {
        request: {
          method: "POST",
          url: ScriptApp.getService().getUrl(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "action=process-sim&fileData=base64_encoded_sim_image&fileName=sim.jpg&mimeType=image/jpeg"
        },
        response: {
          status: "success",
          code: 200,
          data: {
            original: {
              fileUrl: "https://drive.google.com/file/d/xxx/view",
              fileName: "sim.jpg",
              mimeType: "image/jpeg"
            },
            analysis: {
              raw: "Nomor SIM: 1534-8211-001569\nNama: ANDRI WIRATMONO\nTempat/Tanggal Lahir: KEDIRI, 23-11-1982\nJenis Kelamin: PRIA\nGolongan Darah: A\nAlamat: BTN REJOMULYO VII/22\nRT/RW: RT 03 RW 06\nDesa/Kelurahan: \nKecamatan: \nKota: KOTA KEDIRI\nTinggi: \nPekerjaan: KARYAWAN SWASTA\nGolongan SIM: C\nBerlaku Hingga: 22-11-2027\nDikeluarkan di: JATIM\nInstansi Penerbit: ",
              parsed: {
                status: "success",
                nomor_sim: "1534-8211-001569",
                nama: "ANDRI WIRATMONO",
                tempat_tanggal_lahir: "KEDIRI, 23-11-1982",
                jenis_kelamin: "PRIA",
                golongan_darah: "A",
                alamat: "BTN REJOMULYO VII/22",
                rt_rw: "RT 03 RW 06",
                desa_kelurahan: "",
                kecamatan: "",
                kota: "KOTA KEDIRI",
                tinggi: "",
                pekerjaan: "KARYAWAN SWASTA",
                golongan_sim: "C",
                berlaku_hingga: "22-11-2027",
                dikeluarkan_di: "JATIM",
                instansi_penerbit: ""
              }
            }
          }
        }
      }
    }
  };

  return docs;
}

/**
 * Clean up the API response
 */
function cleanupResponse(response) {
  // Minimal cleanup to ensure response is nicely formatted
  return response.trim();
}

/**
 * Parse SIM data from the Gemini API response
 */
function parseSIMData(description) {
  // Initialize object to store parsed data
  const simData = {
    nomor_sim: '',
    nama: '',
    tempat_tanggal_lahir: '',
    jenis_kelamin: '',
    golongan_darah: '',
    alamat: '',
    rt_rw: '',
    desa_kelurahan: '',
    kecamatan: '',
    kota: '',
    tinggi: '',
    pekerjaan: '',
    golongan_sim: '',
    berlaku_hingga: '',
    dikeluarkan_di: '',
    instansi_penerbit: ''
  };

  // Extract Nomor SIM
  const nomorSimMatch = description.match(/Nomor SIM: (.+?)$/m);
  if (nomorSimMatch) {
    simData.nomor_sim = nomorSimMatch[1].trim();
  }

  // Extract Nama
  const namaMatch = description.match(/Nama: (.+?)$/m);
  if (namaMatch) {
    simData.nama = namaMatch[1].trim();
  }

  // Extract Tempat/Tanggal Lahir
  const ttlMatch = description.match(/Tempat\/Tanggal Lahir: (.+?)$/m);
  if (ttlMatch) {
    simData.tempat_tanggal_lahir = ttlMatch[1].trim();
  }

  // Extract Jenis Kelamin
  const jenisKelaminMatch = description.match(/Jenis Kelamin: (.+?)$/m);
  if (jenisKelaminMatch) {
    simData.jenis_kelamin = jenisKelaminMatch[1].trim();
  }

  // Extract Golongan Darah
  const golDarahMatch = description.match(/Golongan Darah: (.+?)$/m);
  if (golDarahMatch) {
    simData.golongan_darah = golDarahMatch[1].trim();
  }

  // Extract Alamat
  const alamatMatch = description.match(/Alamat: (.+?)$/m);
  if (alamatMatch) {
    simData.alamat = alamatMatch[1].trim();
  }

  // Extract RT/RW
  const rtRwMatch = description.match(/RT\/RW: (.+?)$/m);
  if (rtRwMatch) {
    simData.rt_rw = rtRwMatch[1].trim();
  }

  // Extract Desa/Kelurahan
  const desaKelurahanMatch = description.match(/Desa\/Kelurahan: (.+?)$/m);
  if (desaKelurahanMatch) {
    simData.desa_kelurahan = desaKelurahanMatch[1].trim();
  }

  // Extract Kecamatan
  const kecamatanMatch = description.match(/Kecamatan: (.+?)$/m);
  if (kecamatanMatch) {
    simData.kecamatan = kecamatanMatch[1].trim();
  }

  // Extract Kota
  const kotaMatch = description.match(/Kota: (.+?)$/m);
  if (kotaMatch) {
    simData.kota = kotaMatch[1].trim();
  }

  // Extract Tinggi
  const tinggiMatch = description.match(/Tinggi: (.+?)$/m);
  if (tinggiMatch) {
    simData.tinggi = tinggiMatch[1].trim();
  }

  // Extract Pekerjaan
  const pekerjaanMatch = description.match(/Pekerjaan: (.+?)$/m);
  if (pekerjaanMatch) {
    simData.pekerjaan = pekerjaanMatch[1].trim();
  }

  // Extract Golongan SIM
  const golonganSimMatch = description.match(/Golongan SIM: (.+?)$/m);
  if (golonganSimMatch) {
    simData.golongan_sim = golonganSimMatch[1].trim();
  }

  // Extract Berlaku Hingga
  const berlakuMatch = description.match(/Berlaku Hingga: (.+?)$/m);
  if (berlakuMatch) {
    simData.berlaku_hingga = berlakuMatch[1].trim();
  }

  // Extract Dikeluarkan di
  const dikeluarkanMatch = description.match(/Dikeluarkan di: (.+?)$/m);
  if (dikeluarkanMatch) {
    simData.dikeluarkan_di = dikeluarkanMatch[1].trim();
  }

  // Extract Instansi Penerbit
  const instansiPenerbitMatch = description.match(/Instansi Penerbit: (.+?)$/m);
  if (instansiPenerbitMatch) {
    simData.instansi_penerbit = instansiPenerbitMatch[1].trim();
  }

  return simData;
}

/**
 * Save SIM data to sheet
 */
function saveSIMDataToSheet(simData, fileName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dataSheet = spreadsheet.getSheetByName(TRANSACTIONS_SHEET_NAME) || spreadsheet.insertSheet(TRANSACTIONS_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (dataSheet.getLastRow() === 0) {
      dataSheet.appendRow([
        'Timestamp', 
        'File Name',
        'Nomor SIM',
        'Nama',
        'Tempat/Tanggal Lahir',
        'Jenis Kelamin',
        'Golongan Darah',
        'Alamat',
        'RT/RW',
        'Desa/Kelurahan',
        'Kecamatan',
        'Kota',
        'Tinggi',
        'Pekerjaan',
        'Golongan SIM',
        'Berlaku Hingga',
        'Dikeluarkan di',
        'Instansi Penerbit'
      ]);
    }
    
    // Append SIM data
    dataSheet.appendRow([
      new Date().toISOString(),
      fileName,
      simData.nomor_sim,
      simData.nama,
      simData.tempat_tanggal_lahir,
      simData.jenis_kelamin,
      simData.golongan_darah,
      simData.alamat,
      simData.rt_rw,
      simData.desa_kelurahan,
      simData.kecamatan,
      simData.kota,
      simData.tinggi,
      simData.pekerjaan,
      simData.golongan_sim,
      simData.berlaku_hingga,
      simData.dikeluarkan_di,
      simData.instansi_penerbit
    ]);
    
    return true;
  } catch (error) {
    logAction('Data Error', `Error saving SIM data: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Process the uploaded image and get description from Gemini AI
 */
function processImage(fileData, fileName, mimeType) {
  try {
    // Log the request
    logAction('Request', 'Image processing request received', 'INFO');
    
    // Save image to Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
    const file = folder.createFile(blob);
    const fileId = file.getId();
    const fileUrl = file.getUrl();
    
    logAction('File Upload', `File saved to Drive: ${fileName}, ID: ${fileId}`, 'INFO');
    
    // Create request to Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: PROMPT_TEMPLATE },
            { 
              inline_data: { 
                mime_type: mimeType, 
                data: fileData
              } 
            }
          ]
        }
      ]
    };
    
    // Call Gemini API
    const rawResponse = callGeminiAPI(requestBody);
    
    // Clean up the response
    const cleanedResponse = cleanupResponse(rawResponse);
    
    // Check if the document is not a SIM
    if (cleanedResponse === "Dokumen ini bukan SIM") {
      logAction('Info', 'Document is not a SIM', 'INFO');
      
      // Save metadata to spreadsheet
      const metadata = {
        timestamp: new Date().toISOString(),
        fileName: fileName,
        fileId: fileId,
        fileUrl: fileUrl,
        description: cleanedResponse,
        isSIM: false
      };
      
      saveMetadata(metadata);
      
      return {
        success: true,
        description: cleanedResponse,
        fileUrl: fileUrl,
        dataSaved: false
      };
    }
    
    // Parse SIM data
    const simData = parseSIMData(cleanedResponse);
    
    // Save SIM data to sheet
    const dataSaved = saveSIMDataToSheet(simData, fileName);
    
    // Save metadata to spreadsheet
    const metadata = {
      timestamp: new Date().toISOString(),
      fileName: fileName,
      fileId: fileId,
      fileUrl: fileUrl,
      description: rawResponse,
      isSIM: true
    };
    
    saveMetadata(metadata);
    
    logAction('Success', 'Image processed successfully', 'SUCCESS');
    
    return {
      success: true,
      description: cleanedResponse,
      fileUrl: fileUrl,
      dataSaved: dataSaved
    };
  } catch (error) {
    logAction('Error', `Error processing image: ${error.toString()}`, 'ERROR');
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Call Gemini API
 */
function callGeminiAPI(requestBody) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  logAction('API Call', 'Calling Gemini API', 'INFO');
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      logAction('API Error', `Error from Gemini API: ${errorText}`, 'ERROR');
      throw new Error(`API error: ${responseCode} - ${errorText}`);
    }
    
    const responseJson = JSON.parse(response.getContentText());
    
    if (!responseJson.candidates || responseJson.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    // Extract text from response
    const text = responseJson.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    logAction('API Error', `Error calling Gemini API: ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Log actions to spreadsheet
 */
function logAction(action, message, level) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME) || spreadsheet.insertSheet(LOG_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (logSheet.getLastRow() === 0) {
      logSheet.appendRow(['Timestamp', 'Action', 'Message', 'Level']);
    }
    
    logSheet.appendRow([new Date().toISOString(), action, message, level]);
  } catch (error) {
    console.error(`Error logging to spreadsheet: ${error.toString()}`);
  }
}

/**
 * Save metadata to spreadsheet
 */
function saveMetadata(metadata) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metadataSheet = spreadsheet.getSheetByName(METADATA_SHEET_NAME) || spreadsheet.insertSheet(METADATA_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (metadataSheet.getLastRow() === 0) {
      metadataSheet.appendRow(['Timestamp', 'FileName', 'FileID', 'FileURL', 'Description', 'IsSIM']);
    }
    
    metadataSheet.appendRow([
      metadata.timestamp,
      metadata.fileName,
      metadata.fileId,
      metadata.fileUrl,
      metadata.description,
      metadata.isSIM ? 'Yes' : 'No'
    ]);
  } catch (error) {
    logAction('Metadata Error', `Error saving metadata: ${error.toString()}`, 'ERROR');
    throw error;
  }
}
