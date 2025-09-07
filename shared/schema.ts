import { z } from "zod";

// Simple types without database dependencies
export interface WifiGuest {
  id: string;
  title: string;
  fullName: string;
  email: string;
  accessCode: string;
  whatsappNumber: string;
  acceptedTerms: boolean;
  language: string;
  createdAt: Date;
}

export const insertWifiGuestSchema = z.object({
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

export type InsertWifiGuest = z.infer<typeof insertWifiGuestSchema>;