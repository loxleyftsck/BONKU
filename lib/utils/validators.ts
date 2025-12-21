import { z } from "zod";

// Transaction validation with security constraints
export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Pilih tipe transaksi",
  }),
  amount: z
    .number({
      required_error: "Amount harus diisi",
      invalid_type_error: "Amount harus berupa angka",
    })
    .positive("Amount harus lebih dari 0")
    .int("Amount harus bilangan bulat")
    .min(100, "Amount minimal Rp 100")
    .max(999999999, "Amount maksimal Rp 999.999.999"), // ✅ FIX: Prevent overflow
  category: z.string({
    required_error: "Pilih kategori",
  }).min(1, "Kategori harus dipilih"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  date: z
    .string({
      required_error: "Tanggal harus diisi",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)")
    .refine((date) => {
      // ✅ FIX: Prevent future dates
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate <= today;
    }, "Tanggal tidak boleh di masa depan"),
  behavior_tag: z.enum(["planned", "impulsive", "essential"]).optional(),
  is_recurring: z.boolean(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Registration validation with stronger password policy
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .min(5, "Email terlalu pendek")
    .max(100, "Email terlalu panjang"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter") // ✅ FIX: Increased from 6
    .max(100, "Password maksimal 100 karakter")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
