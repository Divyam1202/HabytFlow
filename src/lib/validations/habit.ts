import { z } from 'zod';

export const ProductionHabitTrackerSchema = z.object({
  // Identification
  userId: z.string().cuid().optional(), // Optional for now since we have no DB
  name: z.string().trim().min(1, "Name cannot be empty").max(50, "Name too long"),
  
  // Temporal Sync
  clientTimezone: z.string().refine((tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch (e) {
      return false;
    }
  }, {
    message: "Invalid IANA timezone identifier",
  }),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must use YYYY-MM-DD format"),
  
  // Dynamic Configuration
  type: z.enum(['boolean', 'numeric_volume']),
  targetValue: z.number().positive("Target must be greater than zero").default(1),
  
  // Optional Nutrition Integration (The Macro Integrity Check)
  nutritionPayload: z.object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
  }).optional().refine((data) => {
    if (!data) return true;
    const calculatedCals = (data.protein * 4) + (data.carbs * 4);
    // Allow minor margin for rounding discrepancies (e.g. up to 200 calories off)
    return Math.abs(data.calories - calculatedCals) <= 200;
  }, {
    message: "Thermodynamic Violation: Calorie count mathematically conflicts with macronutrient values.",
  }),
});
