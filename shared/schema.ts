import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wifiGuests = pgTable("wifi_guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  accessCode: text("access_code").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  acceptedTerms: boolean("accepted_terms").notNull().default(false),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWifiGuestSchema = createInsertSchema(wifiGuests).pick({
  fullName: true,
  email: true,
  accessCode: true,
  whatsappNumber: true,
  acceptedTerms: true,
  language: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  accessCode: z.string().min(4, "Access code must be at least 4 characters"),
  whatsappNumber: z.string().min(10, "Please enter a valid WhatsApp number"),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

export type InsertWifiGuest = z.infer<typeof insertWifiGuestSchema>;
export type WifiGuest = typeof wifiGuests.$inferSelect;
