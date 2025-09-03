import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWifiGuestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // WiFi guest registration endpoint
  app.post("/api/wifi/register", async (req, res) => {
    try {
      const validatedData = insertWifiGuestSchema.parse(req.body);
      
      // Check if access code is valid
      const isValidCode = await storage.validateAccessCode(validatedData.accessCode);
      if (!isValidCode) {
        return res.status(400).json({ 
          message: "Invalid access code. Please check with reception.",
          field: "accessCode"
        });
      }

      // Check if email already exists
      const existingGuest = await storage.getWifiGuestByEmail(validatedData.email);
      if (existingGuest) {
        return res.status(400).json({ 
          message: "This email is already registered. You should already have WiFi access.",
          field: "email"
        });
      }

      const guest = await storage.createWifiGuest(validatedData);
      
      res.status(201).json({
        success: true,
        message: "WiFi access granted successfully!",
        guestId: guest.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        return res.status(400).json({ 
          message: "Validation failed",
          errors: fieldErrors
        });
      }
      
      console.error("WiFi registration error:", error);
      res.status(500).json({ 
        message: "Internal server error. Please try again." 
      });
    }
  });

  // Get valid access codes (for testing/admin purposes)
  app.get("/api/wifi/access-codes", async (req, res) => {
    res.json({
      codes: ["ALKEMIA2024", "RIAD123", "GUEST001", "WELCOME", "MARRAKECH"],
      message: "Use any of these codes to test the WiFi registration"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
