import { 
  type User, 
  type InsertUser, 
  type Medication, 
  type InsertMedication,
  type SymptomRecord,
  type InsertSymptomRecord,
  type ImageUpload,
  type InsertImageUpload
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, medication: Partial<Medication>): Promise<Medication | undefined>;
  
  getSymptomRecords(userId: string, medicationId?: string): Promise<SymptomRecord[]>;
  createSymptomRecord(record: InsertSymptomRecord): Promise<SymptomRecord>;
  
  getImageUploads(userId: string): Promise<ImageUpload[]>;
  createImageUpload(upload: InsertImageUpload): Promise<ImageUpload>;
  updateImageUpload(id: string, upload: Partial<ImageUpload>): Promise<ImageUpload | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private medications: Map<string, Medication>;
  private symptomRecords: Map<string, SymptomRecord>;
  private imageUploads: Map<string, ImageUpload>;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.symptomRecords = new Map();
    this.imageUploads = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (med) => med.userId === userId
    ).sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = {
      ...insertMedication,
      id,
      createdAt: new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined> {
    const existing = this.medications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async getSymptomRecords(userId: string, medicationId?: string): Promise<SymptomRecord[]> {
    return Array.from(this.symptomRecords.values())
      .filter((record) => {
        if (record.userId !== userId) return false;
        if (medicationId && record.medicationId !== medicationId) return false;
        return true;
      })
      .sort((a, b) => (b.recordedAt?.getTime() || 0) - (a.recordedAt?.getTime() || 0));
  }

  async createSymptomRecord(insertRecord: InsertSymptomRecord): Promise<SymptomRecord> {
    const id = randomUUID();
    const record: SymptomRecord = {
      ...insertRecord,
      id,
      recordedAt: new Date()
    };
    this.symptomRecords.set(id, record);
    return record;
  }

  async getImageUploads(userId: string): Promise<ImageUpload[]> {
    return Array.from(this.imageUploads.values())
      .filter((upload) => upload.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createImageUpload(insertUpload: InsertImageUpload): Promise<ImageUpload> {
    const id = randomUUID();
    const upload: ImageUpload = {
      ...insertUpload,
      id,
      createdAt: new Date()
    };
    this.imageUploads.set(id, upload);
    return upload;
  }

  async updateImageUpload(id: string, updates: Partial<ImageUpload>): Promise<ImageUpload | undefined> {
    const existing = this.imageUploads.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.imageUploads.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
