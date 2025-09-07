import { randomUUID } from 'crypto';
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

// Helper function to parse request body
async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}

// Helper function to send JSON response
function sendJson(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode).json(data);
}

// Email verification handler
async function handleVerifyEmail(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return sendJson(res, 400, {
        message: "Email is required",
        isValid: false
      });
    }

    const verification = await verifyEmailWithVerimail(email);
    
    return sendJson(res, 200, {
      email,
      isValid: verification.isValid,
      isDeliverable: verification.isDeliverable,
      result: verification.result,
      message: verification.error || (verification.isDeliverable ? "Email is valid and deliverable" : "Email may not be deliverable")
    });
  } catch (error) {
    console.error("Email verification endpoint error:", error);
    return sendJson(res, 500, {
      message: "Email verification service unavailable",
      isValid: false
    });
  }
}

// Guest registration handler
async function handleGuestRegistration(req, res) {
  try {
    const body = await parseRequestBody(req);
    const validatedData = insertWifiGuestSchema.parse(body);
    
    // Check if access code is valid
    const isValidCode = await storage.validateAccessCode(validatedData.accessCode);
    if (!isValidCode) {
      return sendJson(res, 400, { 
        message: "Invalid access code. Please check with reception.",
        field: "accessCode"
      });
    }

    // Verify email with Verimail
    const emailVerification = await verifyEmailWithVerimail(validatedData.email);
    if (!emailVerification.isValid || !emailVerification.isDeliverable) {
      return sendJson(res, 400, {
        message: emailVerification.error || "Please enter a valid email address that can receive emails.",
        field: "email"
      });
    }

    // Check if email already exists
    const existingGuest = await storage.getWifiGuestByEmail(validatedData.email);
    if (existingGuest) {
      return sendJson(res, 400, { 
        message: "This email is already registered. You should already have WiFi access.",
        field: "email"
      });
    }

    const guest = await storage.createWifiGuest(validatedData);
    
    return sendJson(res, 201, {
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
      return sendJson(res, 400, { 
        message: "Validation failed",
        errors: fieldErrors
      });
    }
    
    console.error("WiFi registration error:", error);
    return sendJson(res, 500, { 
      message: "Internal server error. Please try again." 
    });
  }
}

// Main serverless function handler
export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { url, method } = req;
    
    // Route based on URL and method
    if (method === 'POST' && url === '/api/verify-email') {
      return await handleVerifyEmail(req, res);
    }
    
    if (method === 'POST' && url === '/api/guests') {
      return await handleGuestRegistration(req, res);
    }
    
    // Handle 404 for unmatched routes
    return sendJson(res, 404, { 
      message: "Not found" 
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    return sendJson(res, 500, { 
      error: 'Internal server error' 
    });
  }
}