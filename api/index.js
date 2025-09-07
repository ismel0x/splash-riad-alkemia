import express from 'express';
import { randomUUID } from 'crypto';

// Zod schema validation (copied from shared/schema.ts)
import { z } from 'zod';

const insertWifiGuestSchema = z.object({
  title: z.enum(["Mr", "Mrs"], { required_error: "Please select Mr or Mrs" }),
  fullName: z.string()
    .min(4, "Full name must be at least 4 characters")
    .max(30, "Full name must be maximum 30 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name must contain only alphabetic characters and spaces"),
  email: z.string().email("Please enter a valid email address"),
  accessCode: z.string()
    .min(6, "Access code must be at least 6 digits")
    .max(9, "Access code must be maximum 9 digits")
    .regex(/^\d+$/, "Access code must contain only numbers"),
  whatsappNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid international WhatsApp number (e.g., +1234567890)"),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  language: z.string().default("en"),
});

// In-memory storage implementation
class MemStorage {
  constructor() {
    this.wifiGuests = new Map();
  }

  async getWifiGuest(id) {
    return this.wifiGuests.get(id);
  }

  async getWifiGuestByEmail(email) {
    return Array.from(this.wifiGuests.values()).find(
      (guest) => guest.email === email,
    );
  }

  async createWifiGuest(insertGuest) {
    const id = randomUUID();
    const guest = { 
      ...insertGuest, 
      id,
      createdAt: new Date()
    };
    this.wifiGuests.set(id, guest);
    return guest;
  }

  async validateAccessCode(code) {
    // Only validate format - actual verification will be done by RADIUS server
    // Format: 6-9 digits only
    const formatValid = /^\d{6,9}$/.test(code);
    return formatValid;
  }
}

// Create storage instance
const storage = new MemStorage();

// Verimail email verification function
async function verifyEmailWithVerimail(email) {
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

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

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
      const fieldErrors = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
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

// Export the serverless function handler
export default async function handler(req, res) {
  try {
    // Handle the request with Express app
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}