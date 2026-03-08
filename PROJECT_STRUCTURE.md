# Piritiya Project Structure

Clean, organized structure following best practices for full-stack development.

## 📁 Directory Structure

```
piritiya/
├── .kiro/                    # Kiro spec-driven development
│   └── specs/
│       ├── piritiya-backend-api/
│       │   ├── requirements.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── piritiya-chatbot-frontend/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── backend/                  # FastAPI REST API
│   ├── main.py              # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── tests/               # Backend tests
│       ├── test_api.py
│       └── test_chatbot.py
│
├── frontend/                 # React PWA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API clients, cache manager
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── App.tsx          # Main App component
│   │   ├── App.css          # App styles
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── tsconfig.json        # TypeScript configuration
│
├── lambda_functions/         # AWS Lambda functions
│   ├── get_soil_moisture/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   ├── get_crop_advice/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   ├── get_market_prices/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   └── deploy.sh            # Lambda deployment script
│
├── scripts/                  # Infrastructure automation
│   ├── create_dynamodb_tables.py
│   ├── load_mock_data.py
│   ├── create_bedrock_agent.sh
│   ├── grant_lambda_permissions.sh
│   └── test_bedrock_agent.py
│
├── data/                     # Mock data
│   ├── farm_data.json       # Farmer profiles and NISAR data
│   └── nisar_raw/           # Raw satellite data (placeholder)
│
├── docs/                     # Documentation
│   ├── setup/               # Setup and deployment guides
│   │   ├── AWS_SETUP_INDIA.md
│   │   ├── BEDROCK_SETUP.md
│   │   ├── BEDROCK_CONFIG.md
│   │   ├── BEDROCK_MODEL_GUIDE.md
│   │   ├── PHASE1_SETUP.md
│   │   ├── PHASE1_COMPLETE.md
│   │   ├── .phase1_checklist.md
│   │   ├── deploy_us_east_1.sh
│   │   ├── setup_phase1.sh
│   │   └── POLICY_TO_ADD.json
│   ├── guides/              # User guides
│   │   ├── START_HERE.md
│   │   ├── GETTING_STARTED.md
│   │   ├── QUICKSTART.md
│   │   ├── QUICK_REFERENCE.md
│   │   └── CREATE_AGENT_CONSOLE.md
│   ├── troubleshooting/     # Troubleshooting guides
│   │   ├── FIX_BEDROCK_ACCESS.md
│   │   ├── FIX_AGENT_ROLE.md
│   │   ├── SIMPLE_AGENT_FIX.md
│   │   ├── FINAL_AGENT_FIX.md
│   │   ├── FRESH_START.md
│   │   └── WORKAROUND_CHATBOT.md
│   └── README.md            # Documentation index
│
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── README.md                 # Project overview
└── PROJECT_STRUCTURE.md      # This file
```

## 🎯 Key Directories

### `.kiro/specs/`
Spec-driven development documentation following Kiro methodology:
- **requirements.md** - What the system should do
- **design.md** - How it's architected
- **tasks.md** - Implementation checklist

### `backend/`
Python FastAPI REST API server:
- Exposes 9 endpoints for farmer data, soil moisture, crop advice, market prices
- Integrates with AWS Lambda functions and DynamoDB
- Includes Bedrock Agent chatbot integration

### `frontend/`
React 18+ Progressive Web App:
- Voice-first interface (Hindi + English)
- Offline-capable with IndexedDB and Service Workers
- Mobile-first, accessible design
- TypeScript for type safety

### `lambda_functions/`
AWS Lambda serverless functions:
- **get-soil-moisture** - Fetches NISAR satellite data
- **get-crop-advice** - Generates crop recommendations
- **get-market-prices** - Returns market prices

### `scripts/`
Infrastructure automation scripts:
- DynamoDB table creation
- Mock data loading
- Lambda deployment
- Bedrock Agent setup

### `docs/`
Comprehensive documentation:
- **setup/** - Installation and deployment
- **guides/** - How-to guides
- **troubleshooting/** - Problem solving

## 📝 File Naming Conventions

- **Python files:** `snake_case.py`
- **TypeScript/React:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Documentation:** `SCREAMING_SNAKE_CASE.md` for guides, `kebab-case.md` for specs
- **Scripts:** `snake_case.sh` or `snake_case.py`
- **Config files:** `lowercase.json`, `lowercase.config.ts`

## 🔄 Development Workflow

1. **Review specs** in `.kiro/specs/` to understand requirements and design
2. **Check tasks.md** for implementation status
3. **Write code** in `backend/` or `frontend/`
4. **Test locally** using test scripts
5. **Deploy** using scripts in `scripts/` or `lambda_functions/`
6. **Document** in `docs/` if adding new features

## 🚀 Quick Commands

### Backend
```bash
# Start server
cd backend && uvicorn main:app --reload

# Run tests
python backend/tests/test_api.py
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Infrastructure
```bash
# Create DynamoDB tables
python scripts/create_dynamodb_tables.py

# Load mock data
python scripts/load_mock_data.py

# Deploy Lambda functions
./lambda_functions/deploy.sh
```

## 📊 Project Statistics

- **Backend:** 1 FastAPI app, 3 Lambda functions, 4 DynamoDB tables
- **Frontend:** React 18+ PWA with 32 implementation tasks
- **Documentation:** 20+ guides across setup, usage, and troubleshooting
- **Specs:** 2 complete specs (backend + frontend) with requirements, design, and tasks

## 🎨 Design Principles

1. **Separation of Concerns** - Backend, frontend, Lambda, and infrastructure are clearly separated
2. **Spec-Driven Development** - All features documented in `.kiro/specs/` before implementation
3. **Documentation First** - Comprehensive docs in `docs/` for all aspects
4. **Test Coverage** - Tests in `backend/tests/` and frontend test structure
5. **Clean Root** - Only essential files in root directory

## 🔐 Security Notes

- `.env` file contains secrets (not in git)
- `.env.example` provides template
- AWS credentials configured via environment variables
- No hardcoded secrets in code

## 📦 Dependencies

### Backend
- Python 3.11+
- FastAPI, boto3, uvicorn, pydantic

### Frontend
- Node.js 18+
- React 19, TypeScript, Vite
- (Additional dependencies per spec: Tailwind, idb, Workbox, fast-check)

### AWS Services
- Lambda, DynamoDB, Bedrock Agent Runtime, S3 (referenced)

## 🎯 Next Steps

1. ✅ Project structure cleaned and organized
2. ✅ Documentation consolidated in `docs/`
3. ✅ Specs created for backend and frontend
4. 🚧 Implement frontend per `.kiro/specs/piritiya-chatbot-frontend/tasks.md`
5. ⏳ Complete Bedrock Agent setup
6. ⏳ Add automated tests
7. ⏳ Set up CI/CD pipeline

---

**Structure Version:** 2.0  
**Last Updated:** 2026-03-01  
**Status:** ✅ Clean and organized
