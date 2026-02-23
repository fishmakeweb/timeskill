# 🎯 TimeSkill - Quản Lý Thời Gian & Thói Quen với AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![AI](https://img.shields.io/badge/AI-GPT--4o-purple)](https://openai.com/)

Ứng dụng quản lý thời gian, theo dõi thói quen hàng ngày, quản lý deadline và tính toán GPA cho học sinh, sinh viên - **được hỗ trợ bởi AI**.

---

## ✨ Features Chính

### 🔐 Authentication System

- Đăng ký/Đăng nhập với email/password
- Google OAuth integration (ready)
- Session management với NextAuth.js
- Protected routes middleware

### 🏃 Daily Habits Tracker

- ✅ Check-in hàng ngày (thể dục, nước, ngủ, calo)
- 📊 Hệ thống tính điểm tự động (0-100)
- 🔥 Streak counter - đếm số ngày liên tiếp đạt mục tiêu
- 📈 Weekly Report với line charts (Recharts)
- 💡 Rule-based insights & gợi ý cải thiện
- ⚙️ Customizable scoring rules
- 🤖 **AI Insights - Phân tích thói quen với GPT-4o**

### 📝 Task & Deadline Manager

- ✅ CRUD tasks với priority (Low, Medium, High)
- 🎯 Auto-sorting theo deadline và priority
- 🔔 **Notification system với unread badge**
- ⏰ Deadline countdown & urgent warnings
- 🎨 Visual priority badges
- 📱 Filter theo status và priority
- 🔄 Status toggle (Not Started → In Progress → Completed)

### 📚 GPA Calculator

- ➕ Thêm môn học theo học kỳ
- 🔢 Hỗ trợ thang điểm 10 và 4.0
- 🧮 Tính GPA tự động
- 📊 GPA tổng hợp (cumulative)
- 🎨 Visual display với color-coded

### 📊 Smart Dashboard

- 📈 Real-time stats (Today's score, Streak, Tasks, GPA)
- 📋 Upcoming tasks preview (top 5)
- 🚀 Quick action cards
- 🎨 Gradient design với hover effects
- 🔔 Notification bell integration
- 🤖 **AI Chat Assistant - Floating chatbot**

### 🤖 AI Features 🌟

- 💬 **AI Chat Assistant** - Trợ lý AI hỗ trợ 24/7
  - Context-aware responses (biết score, streak, GPA của bạn)
  - Quick question shortcuts
  - Beautiful gradient UI
  - Floating widget on all pages
- 🧠 **Smart Insights** - Phân tích thói quen cá nhân hóa
  - 30-day data analysis
  - Strengths & weaknesses identification
  - Personalized recommendations
  - Progress predictions
  - Structured report (Tổng quan, Điểm mạnh, Điểm yếu, Lời khuyên, Dự đoán)
- ⚡ Powered by **GPT-4o** via v98store
- 💰 Cost-effective: ~$0.005 per chat, ~$0.02 per insight

### 🎨 UI/UX Enhancements

- **Color Palette**: Primary #6961d5 (Purple), Secondary #f9edfa (Light Pink)
- Toast notifications (react-hot-toast)
- Loading skeleton components
- Smooth animations & transitions
- Custom 404 & Error pages
- Responsive design (mobile-first)
- Tailwind CSS v4 + Shadcn/UI

### 🏗️ Infrastructure

- Docker + Docker Compose ready
- MongoDB + Mongoose ODM
- TypeScript with strict types
- Health check endpoint
- Environment-based configuration

---

## 🚀 Quick Start

### ⚡ Development Setup (Recommended)

```bash
# 1. Clone repository
git clone <repo-url>
cd timeskill

# 2. Start MongoDB with Docker
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Configure .env.local (already set up)
# Just add your V98STORE_API_KEY if needed

# 5. Run development server
npm run dev

# 6. Open http://localhost:3000
```

📖 **Chi tiết:** [DEV_SETUP.md](DEV_SETUP.md) - Development guide với MongoDB trong Docker

### 🐳 Full Docker Deployment

```bash
# For production deployment with Docker
# See DOCKER_SETUP.md for full guide

docker-compose -f docker-compose.prod.yml up -d
```

📖 **Chi tiết:** [DOCKER_SETUP.md](DOCKER_SETUP.md) - Full Docker deployment guide

---

## 📚 Documentation

| File                                                             | Description                                              |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| [DEV_SETUP.md](DEV_SETUP.md)                                     | 🚀 Development environment guide (MongoDB + npm run dev) |
| [QUICK_SETUP.md](QUICK_SETUP.md)                                 | 5-minute setup guide với troubleshooting                 |
| [DOCKER_SETUP.md](DOCKER_SETUP.md)                               | 🐳 Docker deployment guide chi tiết                      |
| [PROGRESS_REPORT.md](PROGRESS_REPORT.md)                         | Báo cáo tiến độ chi tiết (75% → 100%)                    |
| [LLM_INTEGRATION_PLAN.md](LLM_INTEGRATION_PLAN.md)               | Kế hoạch tích hợp AI (implemented)                       |
| [FINAL_IMPLEMENTATION_REPORT.md](FINAL_IMPLEMENTATION_REPORT.md) | Tài liệu toàn diện: API, testing, deployment             |
| [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md)               | Requirements ban đầu                                     |
| [COMPLETION_PLAN.md](COMPLETION_PLAN.md)                         | Kế hoạch hoàn thiện                                      |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/         # NextAuth & Register
│   │   ├── habits/       # Habits CRUD + Settings
│   │   ├── tasks/        # Tasks CRUD
│   │   ├── courses/      # Courses CRUD
│   │   ├── gpa/          # GPA Calculator
│   │   ├── notifications/# Notification system (NEW)
│   │   └── ai/           # AI endpoints (NEW)
│   │       ├── chat/     # Chat assistant
│   │       └── insights/ # Habit analysis
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard + AI Assistant
│   ├── habits/           # Habits + AI Insights
│   ├── tasks/            # Tasks manager
│   └── courses/          # GPA calculator
├── components/
│   ├── ui/               # Shadcn components
│   ├── AIAssistant.tsx   # Floating chatbot (NEW)
│   ├── AIInsights.tsx    # Analysis card (NEW)
│   ├── NotificationBell.tsx # Notification bell (NEW)
│   └── habits/WeeklyReport.tsx
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # MongoDB connection
│   ├── openai.ts         # OpenAI client (NEW)
│   ├── habitCalculations.ts
│   ├── gpaCalculations.ts
│   └── taskUtils.ts
├── models/
│   ├── User.ts
│   ├── Habit.ts
│   ├── Task.ts
│   ├── Course.ts
│   └── Notification.ts   # (NEW)
└── types/
    ├── index.ts
    └── next-auth.d.ts
```

---

## 🎮 Usage Guide

1. **Đăng ký**: `/auth/register` - Tạo tài khoản mới
2. **Đăng nhập**: `/auth/signin` - Login với email/password
3. **Dashboard**: `/dashboard` - Tổng quan stats, chat với AI
4. **Habits**: `/habits` - Check-in hàng ngày, xem insights AI
5. **Tasks**: `/tasks` - Quản lý deadline, nhận thông báo
6. **GPA**: `/courses` - Thêm môn học & tính GPA

### 💬 AI Chat Assistant

- Click icon 💬 ở góc dưới bên phải
- Hỏi về bất kỳ điều gì: habits, tasks, GPA, tips
- AI biết context của bạn (score hiện tại, streak, GPA)

### 🧠 AI Insights

- Vào `/habits`
- Click "Phân tích bằng AI" 🤖
- Nhận phân tích chi tiết về 30 ngày qua
- Refresh để cập nhật analysis mới

---

## 🐳 Docker Commands

```bash
# Build và start
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Restart single service
docker-compose restart app
```

# Database

MONGODB_URI=mongodb://mongodb:27017/timeskill

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl-rand-base64-32>

# Google OAuth (optional)

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI Features (required for AI)

V98STORE_API_KEY=<from-v98store.com>
AI_MODEL=gpt-4o

```

--- production
npm run build

# Start production
npm start

# Lint
npm run lint

# Health check
curl http://localhost:3000/api/health
```

### Test Checklist

- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập
- [ ] Check-in habit hôm nay
- [ ] Xem weekly report
- [ ] Tạo task mới
- [ ] Nhận notification
- [ ] Chat với AI
- [ ] Xem AI insights
- [ ] Thêm môn học
- [ ] Xem GPA

---

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Health check
curl http://localhost:3000/api/health
```

## 📊 API Endpoints

### 🔐 Authentication

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/signout` - Đăng xuất

### 🏃 Habits

- `GET /api/habits` - List all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `GET /api/habits/settings` - Get scoring settings

---

## 🚧 Roadmap & Known Limitations

### ✅ Completed (100%)

- ✅ Authentication system
- ✅ Habits tracker với analytics
- ✅ Task manager với notifications
- ✅ GPA calculator
- ✅ Smart dashboard
- ✅ AI Chat Assistant
- ✅ AI Habit Insights
- ✅ Notification system
- ✅ Docker deployment

### 🚀 Future Enhancements

- [ ] Dark mode toggle
- [ ] Export PDF/CSV reports
- [ ] Email notifications
- [ ] PWA support (offline mode)
- [ ] Advanced analytics charts
- [ ] AI task suggestions
- [ ] AI weekly report generation
- [ ] Multi-language support

### ⚠️ Known Issues

- Dark mode not implemented yet
- AI features require valid API key
- Email notifications not configured
- No offline support

---

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - App Router, React Server Components
- **React 19** - Latest features
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Inline theme configuration
- **Shadcn/UI** - Accessible components
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend

- **MongoDB 7** - NoSQL database
- **Mongoose** - ODM with schemas
- **NextAuth.js** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation

### AI & APIs

- **OpenAI SDK** - GPT-4o integration
- **v98store** - AI API proxy

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📄 License

MIT License - free to use for personal and commercial projects.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

- 📖 **Documentation**: See [FINAL_IMPLEMENTATION_REPORT.md](FINAL_IMPLEMENTATION_REPORT.md)
- 🐛 **Bug Reports**: Open an issue
- 💡 **Feature Requests**: Open an issue
- 📧 **Contact**: [your-email]

---

**Version**: 2.0 (AI-Powered)  
**Status**: ✅ Production Ready  
**Last Updated**: 2024

🎯 **TimeSkill** - Quản lý thời gian thông minh với sức mạnh AIatedAt: string }`

---

## 🚧 Features Chưa Implement

- Phase 3: Habits Analytics & Charts
- Phase 5: Notifications & Email Reminders
- Phase 8: Advanced Analytics & Export PDF/CSV
- Phase 9: Dark Mode, Animations
- PWA Support

Chi tiết đầy đủ tại [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md)

## 🛠 Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS + Shadcn/UI
- MongoDB + Mongoose
- NextAuth.js
- Docker + Docker Compose
- Zod validation

## 📝 License

MIT

---

**Version**: 1.0 MVP  
**Status**: Core features ready for use
