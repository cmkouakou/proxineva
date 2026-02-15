import { z } from "zod";

export const ServiceRequestSchema = z.object({
  zone: z.enum(["CANADA", "CIV"]),
  category: z.string().min(2).max(60),
  mode: z.enum(["DOMICILE", "EN_LIGNE"]),
  priority: z.enum(["EXPRESS", "NORMAL"]),

  full_name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40).optional().or(z.literal("")),
  description: z.string().min(10).max(4000),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;
