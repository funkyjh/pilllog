import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { storage } from "./storage";
import { insertMedicationSchema, insertSymptomRecordSchema, insertImageUploadSchema } from "@shared/schema";
import { extractTextFromImage } from "./services/ocr";
import { parsePrescriptionText, createMedicationFromParsedData } from "./services/textParser";
import { medicationSearchService } from "./services/medicationSearch";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user's medications
  app.get("/api/medications", async (req, res) => {
    try {
      // For demo purposes, using a hardcoded user ID
      const userId = "demo-user-id";
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  // Get specific medication
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error('Error fetching medication:', error);
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  // Create medication manually
  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse({
        ...req.body,
        userId: "demo-user-id" // For demo purposes
      });
      
      const medication = await storage.createMedication(validatedData);
      res.json(medication);
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(400).json({ message: "Invalid medication data" });
    }
  });

  // Update medication
  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.updateMedication(req.params.id, req.body);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error('Error updating medication:', error);
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  // Upload prescription image
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const userId = "demo-user-id"; // For demo purposes
      
      // Create initial upload record
      const uploadRecord = await storage.createImageUpload({
        userId,
        fileName: req.file.originalname,
        originalUrl: `upload_${Date.now()}_${req.file.originalname}`,
        processingStatus: "processing"
      });

      // Process image asynchronously
      processImageAsync(req.file.buffer, uploadRecord.id, userId);

      res.json({ 
        uploadId: uploadRecord.id,
        status: "processing",
        message: "Image uploaded successfully. Processing in progress..." 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Get upload status
  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const uploads = await storage.getImageUploads("demo-user-id");
      const upload = uploads.find(u => u.id === req.params.id);
      
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      
      res.json(upload);
    } catch (error) {
      console.error('Error fetching upload:', error);
      res.status(500).json({ message: "Failed to fetch upload status" });
    }
  });

  // Get user's recent uploads
  app.get("/api/uploads", async (req, res) => {
    try {
      const uploads = await storage.getImageUploads("demo-user-id");
      res.json(uploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  // Get symptom records
  app.get("/api/symptoms", async (req, res) => {
    try {
      const userId = "demo-user-id";
      const medicationId = req.query.medicationId as string;
      const records = await storage.getSymptomRecords(userId, medicationId);
      res.json(records);
    } catch (error) {
      console.error('Error fetching symptom records:', error);
      res.status(500).json({ message: "Failed to fetch symptom records" });
    }
  });

  // Create symptom record
  app.post("/api/symptoms", async (req, res) => {
    try {
      const validatedData = insertSymptomRecordSchema.parse({
        ...req.body,
        userId: "demo-user-id" // For demo purposes
      });
      
      const record = await storage.createSymptomRecord(validatedData);
      res.json(record);
    } catch (error) {
      console.error('Error creating symptom record:', error);
      res.status(400).json({ message: "Invalid symptom record data" });
    }
  });

  // Search medications from KFDA API
  app.get("/api/medications/search", async (req, res) => {
    try {
      const { query, type = 'name', page = 1, limit = 10 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "검색어가 필요합니다" });
      }

      let searchResult;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      switch (type) {
        case 'ingredient':
          searchResult = await medicationSearchService.searchByIngredient(query, pageNum, limitNum);
          break;
        case 'company':
          searchResult = await medicationSearchService.searchByCompany(query, pageNum, limitNum);
          break;
        default:
          searchResult = await medicationSearchService.searchByName(query, pageNum, limitNum);
          break;
      }

      res.json(searchResult);
    } catch (error) {
      console.error('Error searching medications:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "약품 검색 중 오류가 발생했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process image and extract medication data
async function processImageAsync(imageBuffer: Buffer, uploadId: string, userId: string) {
  try {
    // Extract text using OCR
    const extractedText = await extractTextFromImage(imageBuffer);
    
    // Update upload with extracted text
    await storage.updateImageUpload(uploadId, {
      extractedText,
      processingStatus: "completed"
    });

    // Parse prescription data
    const parsedData = parsePrescriptionText(extractedText);
    
    // Create medication if valid data was extracted
    if (parsedData.name) {
      const medicationData = createMedicationFromParsedData(parsedData, userId);
      const medication = await storage.createMedication(medicationData);
      
      // Link upload to medication
      await storage.updateImageUpload(uploadId, {
        medicationId: medication.id
      });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    await storage.updateImageUpload(uploadId, {
      processingStatus: "failed"
    });
  }
}
