# FuelEU Maritime — Compliance Dashboard

A comprehensive Fuel EU Maritime compliance management system built with React, TypeScript, Node.js, and PostgreSQL. The application implements Article 20 (Banking) and Article 21 (Pooling) of the Fuel EU regulation.

## 🏗️ Architecture

The project follows **Hexagonal Architecture** (Ports & Adapters) pattern:

### Frontend Structure
```
frontend/src/
  ├── core/
  │   ├── domain/          # Domain types and entities
  │   └── hooks/           # Custom React hooks (e.g., useDarkMode)
  ├── adapters/
  │   ├── ui/              # React components (RoutesTab, CompareTab, etc.)
  │   └── infrastructure/  # API clients and external services
  └── App.tsx              # Main application component
```

### Backend Structure
```
backend/src/
  ├── core/
  │   └── application/    # Business logic (computeCB, banking, createPool)
  ├── adapters/
  │   └── inbound/http/   # Express routers and controllers
  └── infrastructure/
      ├── db/             # Database setup and seeding
      └── server/         # Express server configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure database:**
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fueleu?schema=public"
```

3. **Run migrations:**
```bash
npm run migrate
```

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the development server:**
```bash
npm run dev
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## 📊 Features

### 1. Routes Tab
- View all shipping routes with detailed metrics
- Filter by vessel type, fuel type, and year
- Set baseline routes for comparison
- Beautiful table with sorting and visual indicators

### 2. Compare Tab
- Compare routes against baseline
- Visual bar chart showing GHG intensity differences
- Compliance status indicators (✅/❌)
- Percentage difference calculations

### 3. Banking Tab (Article 20)
- View compliance balance (CB)
- Bank positive surplus for future use
- Apply banked surplus to cover deficits
- View banking transaction history
- Real-time CB calculations

### 4. Pooling Tab (Article 21)
- Create pools with multiple ship members
- Automatic surplus-to-deficit allocation
- Pool sum validation (must be ≥ 0)
- Before/after CB visualization
- Rule enforcement indicators

### 5. Dark Mode
- Toggle between light and dark themes
- Persistent preference storage
- System preference detection
- Smooth transitions

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- **Backend**: 43 tests covering core logic and API endpoints
- **Frontend**: 15 tests covering components and hooks

See `TESTING.md` for detailed testing documentation.

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── core/application/      # Business logic
│   │   ├── adapters/inbound/http/ # API routes
│   │   └── infrastructure/        # Infrastructure
│   ├── prisma/                    # Database schema & migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── core/                  # Domain & hooks
│   │   ├── adapters/ui/           # React components
│   │   └── adapters/infrastructure/ # API clients
│   └── package.json
├── README.md
├── AGENT_WORKFLOW.md
└── REFLECTION.md
```

## 🔧 API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes/:id/baseline` - Set baseline route
- `GET /api/routes/comparison` - Get comparison data

### Compliance
- `GET /api/compliance/cb?year=YYYY&shipId=XXX` - Calculate compliance balance
- `GET /api/compliance/adjusted-cb?shipId=XXX&year=YYYY` - Get adjusted CB

### Banking
- `POST /api/banking/bank` - Bank surplus
- `POST /api/banking/apply` - Apply banked surplus
- `GET /api/banking/records?shipId=XXX&year=YYYY` - Get banking records

### Pools
- `POST /api/pools` - Create pool
- `GET /api/pools/adjusted-cb?poolId=XXX` - Get pool adjusted CB

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, card-based layout, smooth animations
- **Responsive**: Works on desktop and tablet devices
- **Dark Mode**: Full dark mode support with system preference detection
- **Interactive**: Hover effects, loading states, error handling
- **Data Visualization**: Charts for route comparisons

## 📝 Key Formulas

- **Target Intensity**: 89.3368 gCO₂e/MJ (2% below 91.16)
- **Energy per Ton**: 41,000 MJ/t
- **Compliance Balance**: `(Target - Actual) × Energy`
- **Percent Difference**: `((Comparison / Baseline) - 1) × 100`


## 📚 Documentation
- `AGENT_WORKFLOW.md` - AI agent usage log
- `REFLECTION.md` - Development reflections

## 🛠️ Tech Stack

**Frontend:**
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.2
- Tailwind CSS 4.1.17
- React Router 7.9.5
- Recharts 3.3.0
- Vitest 4.0.8

**Backend:**
- Node.js
- Express 4.18.2
- TypeScript 5.5.0
- Prisma 5.5.0
- PostgreSQL
- Vitest 0.34.0

## 📄 License

Private project for Fuel EU compliance assignment.
