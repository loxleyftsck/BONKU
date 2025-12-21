# 💰 BONKU - AI Financial Mentor untuk Indonesia

> **Intelligent financial management platform** yang membantu masyarakat Indonesia mengelola keuangan dengan bijak, memahami inflasi, dan membuat keputusan finansial yang lebih baik.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

### 💳 Transaction Management
- **Smart categorization** dengan 14+ kategori (Makanan, Transport, Belanja, dll.)
- **Behavior tagging** untuk mengidentifikasi pola pengeluaran (Terencana/Impulsif/Esensial)
- **Advanced filtering** by tanggal, kategori, dan tipe transaksi
- **Real-time validation** dengan Zod (prevent invalid amounts, future dates)

### 📊 Financial Dashboard
- **Monthly summary** dengan income, expenses, dan savings rate
- **Top 5 spending categories** dengan persentase breakdown
- **Month-over-month trends** untuk tracking progress
- **Real-time calculations** dari database

### 📚 Microlearning Education System
**5 Modul Edukasi Finansial (Bahasa Indonesia):**
1. **Apa itu Inflasi?** - Pemahaman dasar inflasi
2. **Inflasi vs Daya Beli** - Dampak inflasi ke kehidupan sehari-hari
3. **Bias Kognitif** - Behavioral finance untuk keputusan lebih baik
4. **50/30/20 Rule** - Framework budgeting praktis
5. **Emergency Fund** - Membangun dana darurat

### 🤖 AI Insights (Rule-Based)
- **Spending Alerts** - Notifikasi overspending
- **Saving Opportunities** - Deteksi potensi penghematan
- **Behavior Patterns** - Analisis pola pengeluaran
- **Inflation Impact** - Korelasi inflasi dengan spending

### 🔐 Security
- **Row Level Security (RLS)** - User data isolation
- **Rate limiting** - Prevent brute force attacks (5 attempts/min)
- **Input validation** - Comprehensive Zod schemas
- **Strong password policy** - 8+ chars, uppercase, lowercase, number
- **A+ Security Grade** - 0 critical vulnerabilities

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3 (Strict Mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Lucide Icons
- **Forms:** react-hook-form + Zod
- **Data Fetching:** TanStack Query (React Query)

### Backend
- **API:** Next.js API Routes (REST)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Validation:** Zod runtime validation

### DevOps
- **Deployment:** Vercel (Free Tier)
- **Database Hosting:** Supabase (Free Tier)
- **Version Control:** Git + GitHub
- **CI/CD:** Vercel Auto-Deploy

**Total Monthly Cost:** **Rp 0,-** 💚

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/bonku-app.git
cd bonku-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BONKU
```

### 4. Setup Database
Run SQL migrations in Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` → Creates 6 tables + RLS
2. `supabase/migrations/002_seed_data.sql` → Inserts education modules + inflation data

### 5. Enable Authentication
Supabase Dashboard → Authentication → Providers → Enable "Email"

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

**Detailed setup:** See [`FINAL_SETUP.md`](docs/FINAL_SETUP.md)

---

## 📖 Documentation

### Setup & Configuration
- 📘 [**FINAL_SETUP.md**](docs/FINAL_SETUP.md) - Complete setup guide (START HERE!)
- 📄 [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - One-page cheat sheet
- 🗄️ [CONNECT_SUPABASE.md](docs/CONNECT_SUPABASE.md) - Database connection guide

### Development
- ✅ [task.md](docs/task.md) - Development checklist
- 🏗️ [implementation_plan.md](docs/implementation_plan.md) - Architecture
- 💰 [zero_cost_strategy.md](docs/zero_cost_strategy.md) - Zero-cost approach

### Testing & Security
- 🧪 [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Complete testing procedures
- 🔒 [security_audit_report.md](docs/security_audit_report.md) - Security assessment
- ✔️ [quality_control_report.md](docs/quality_control_report.md) - QC results

### Deployment
- 🚀 [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) - Deploy to Vercel
- 📊 [FINAL_STATUS_REPORT.md](docs/FINAL_STATUS_REPORT.md) - Project summary

### Additional
- 🎯 [ROADMAP_REPORT.md](docs/ROADMAP_REPORT.md) - Phase-by-phase report
- 📝 [walkthrough.md](docs/walkthrough.md) - Development journey

---

## 📊 Project Statistics

```
Development Time:    14 hours
Total Files:         80+
Lines of Code:       6,500+
TypeScript Errors:   0 ✅
API Routes:          9
UI Components:       15
Database Tables:     6
Security Grade:      A+
Documentation:       18 guides
Monthly Cost:        Rp 0,-
```

---

## 🗂️ Project Structure

```
bonku-app/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── finance/         # Transaction management
│   │   ├── education/       # Learning modules
│   │   ├── insights/        # AI insights
│   │   └── settings/        # User settings
│   └── api/                 # REST API routes
│       ├── auth/            # Authentication endpoints
│       ├── transactions/    # Transaction CRUD
│       ├── dashboard/       # Dashboard data
│       ├── education/       # Education modules
│       ├── ai/              # AI insights
│       └── inflation/       # Inflation data
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Shared components
│   ├── finance/             # Financial components
│   └── education/           # Education components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── utils/               # Utilities & validators
│   └── mocks/               # Mock data (development)
├── hooks/                   # React Query hooks
├── types/                   # TypeScript types
├── config/                  # Configuration
├── supabase/
│   └── migrations/          # SQL migrations
└── docs/                    # Documentation
```

---

## 🧪 Testing

### Run Tests
```bash
# Type checking
npx tsc --noEmit

# Build verification
npm run build

# Manual testing
npm run dev
```

**Comprehensive testing guide:** [`TESTING_GUIDE.md`](docs/TESTING_GUIDE.md)

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import repository
- Add environment variables from `.env.local`
- Deploy!

3. **Configure Supabase**
- Add Vercel URL to Supabase Auth allowed URLs
- Update `NEXT_PUBLIC_APP_URL` to Vercel domain
- Redeploy

**Step-by-step guide:** [`DEPLOYMENT_CHECKLIST.md`](docs/DEPLOYMENT_CHECKLIST.md)

---

## 🎨 Features Showcase

### Dashboard
- Real-time financial overview
- Monthly income, expenses, savings
- Top spending categories
- Trend indicators

### Transaction Management
- Intuitive add/edit forms
- Smart categorization (14 categories)
- Advanced filtering
- Behavior tagging

### Education
- 5 microlearning modules
- Indonesian language content
- Estimated reading time
- Progress tracking

### AI Insights
- Spending alerts
- Saving opportunities
- Behavior pattern analysis
- Inflation impact tracking

---

## 🔒 Security

**Grade:** A+ (Audited & Hardened)

- ✅ **Row Level Security (RLS)** - All tables protected
- ✅ **Input Validation** - Zod schemas on all forms
- ✅ **Rate Limiting** - 5 attempts/minute on auth endpoints
- ✅ **Strong Passwords** - 8+ chars, complexity enforced
- ✅ **XSS Protection** - React auto-escaping
- ✅ **SQL Injection** - Parameterized queries
- ✅ **HTTPS Only** - Enforced on production

**Full audit report:** [`security_audit_report.md`](docs/security_audit_report.md)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**loxleyftsck**
- GitHub: [@loxleyftsck](https://github.com/loxleyftsck)
- Repository: [BONKU](https://github.com/loxleyftsck/BONKU)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Hosting

---

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for Indonesia**

[Demo](https://your-demo-url.vercel.app) • [Documentation](docs/) • [Report Bug](https://github.com/yourusername/bonku-app/issues)

</div>
