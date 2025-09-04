import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wifiGuests = pgTable("wifi_guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  accessCode: text("access_code").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  acceptedTerms: boolean("accepted_terms").notNull().default(false),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWifiGuestSchema = createInsertSchema(wifiGuests).pick({
  title: true,
  fullName: true,
  email: true,
  accessCode: true,
  whatsappNumber: true,
  acceptedTerms: true,
  language: true,
}).extend({
  title: z.enum(["Mr", "Mrs"], { required_error: "Please select Mr or Mrs" }),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string()
    .min(4, "Full name must be at least 4 characters")
    .max(30, "Full name must be maximum 30 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name must contain only alphabetic characters and spaces"),
  accessCode: z.string()
    .max(9, "Access code must be maximum 9 digits")
    .regex(/^\d+$/, "Access code must contain only numbers"),
  whatsappNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid international WhatsApp number (e.g., +1234567890)"),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

export type InsertWifiGuest = z.infer<typeof insertWifiGuestSchema>;
export type WifiGuest = typeof wifiGuests.$inferSelect;
