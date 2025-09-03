import { type WifiGuest, type InsertWifiGuest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getWifiGuest(id: string): Promise<WifiGuest | undefined>;
  getWifiGuestByEmail(email: string): Promise<WifiGuest | undefined>;
  createWifiGuest(guest: InsertWifiGuest): Promise<WifiGuest>;
  validateAccessCode(code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private wifiGuests: Map<string, WifiGuest>;
  private validAccessCodes: Set<string>;

  constructor() {
    this.wifiGuests = new Map();
    // Add some valid access codes for testing
    this.validAccessCodes = new Set([
      "ALKEMIA2024",
      "RIAD123",
      "GUEST001",
      "WELCOME",
      "MARRAKECH"
    ]);
  }

  async getWifiGuest(id: string): Promise<WifiGuest | undefined> {
    return this.wifiGuests.get(id);
  }

  async getWifiGuestByEmail(email: string): Promise<WifiGuest | undefined> {
    return Array.from(this.wifiGuests.values()).find(
      (guest) => guest.email === email,
    );
  }

  async createWifiGuest(insertGuest: InsertWifiGuest): Promise<WifiGuest> {
    const id = randomUUID();
    const guest: WifiGuest = { 
      ...insertGuest, 
      id,
      createdAt: new Date()
    };
    this.wifiGuests.set(id, guest);
    return guest;
  }

  async validateAccessCode(code: string): Promise<boolean> {
    return this.validAccessCodes.has(code);
  }
}

export const storage = new MemStorage();
