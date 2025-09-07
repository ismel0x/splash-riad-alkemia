import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWifiGuestSchema } from "@shared/schema";
import { z } from "zod";

// Verimail email verification function
async function verifyEmailWithVerimail(email: string): Promise<{
  isValid: boolean;
  isDeliverable: boolean;
  result: string;
  error?: string;
}> {
  const apiKey = process.env.VERIMAIL_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      isDeliverable: false,
      result: "error",
      error: "Verimail API key not configured"
    };
  }

  try {
    const response = await fetch(`https://api.verimail.io/v3/verify?email=${encodeURIComponent(email)}&key=${apiKey}`);
    const data = await response.json();

    return {
      isValid: response.ok && data.status === "success",
      isDeliverable: data.deliverable === true,
      result: data.result || "unknown",
      error: !response.ok ? data.message || "Verification failed" : undefined
    };
  } catch (error) {
    console.error("Verimail verification error:", error);
    return {
      isValid: false,
      isDeliverable: false,
      result: "error",
      error: "Email verification service unavailable"
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Email verification endpoint
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          message: "Email is required",
          isValid: false
        });
      }

      const verification = await verifyEmailWithVerimail(email);
      
      res.json({
        email,
        isValid: verification.isValid,
        isDeliverable: verification.isDeliverable,
        result: verification.result,
        message: verification.error || (verification.isDeliverable ? "Email is valid and deliverable" : "Email may not be deliverable")
      });
    } catch (error) {
      console.error("Email verification endpoint error:", error);
      res.status(500).json({
        message: "Email verification service unavailable",
        isValid: false
      });
    }
  });

  // WiFi guest registration endpoint
  app.post("/api/guests", async (req, res) => {
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

      // Verify email with Verimail
      const emailVerification = await verifyEmailWithVerimail(validatedData.email);
      if (!emailVerification.isValid || !emailVerification.isDeliverable) {
        return res.status(400).json({
          message: emailVerification.error || "Please enter a valid email address that can receive emails.",
          field: "email"
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


  const httpServer = createServer(app);
  return httpServer;
}
