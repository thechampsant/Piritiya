# Piritiya - Agricultural Advisory System

AI-powered agricultural advisory platform for Uttar Pradesh farmers to prevent groundwater depletion using NISAR satellite data.

## 🌾 Overview

Piritiya provides farmers with:
- Real-time soil moisture data from NISAR satellite (100m resolution)
- Water-efficient crop recommendations based on groundwater status
- Market prices for informed planting decisions
- Voice-first conversational interface in Hindi and English
- Offline-capable Progressive Web App (PWA)

## 📁 Project Structure

```
piritiya/
├── .kiro/specs/              # Spec-driven development documentation
│   ├── piritiya-backend-api/
│   └── piritiya-chatbot-frontend/
├── backend/                  # FastAPI REST API server
│   ├── main.py
│   ├── requirements.txt
│   └── tests/
├── frontend/                 # React PWA with voice interface
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API clients, cache manager
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   └── public/
├── lambda_functions/         # AWS Lambda functions
│   ├── get_soil_moisture/
│   ├── get_crop_advice/
│   └── get_market_prices/
├── scripts/                  # Infrastructure automation
├── data/                     # Mock data for development
├── docs/                     # Documentation
│   ├── setup/               # Setup and deployment guides
│   ├── troubleshooting/     # Troubleshooting guides
│   └── guides/              # User guides
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS Account with credentials configured
- AWS CLI installed

### Backend Setup

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and region
   ```

4. **Create DynamoDB tables:**
   ```bash
   python scripts/create_dynamodb_tables.py
   ```

5. **Load mock data:**
   ```bash
   python scripts/load_mock_data.py
   ```

6. **Deploy Lambda functions:**
   ```bash
   ./lambda_functions/deploy.sh
   ```

7. **Start backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

   API will be available at: http://localhost:8000

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:5173

### Testing

**Backend API:**
```bash
cd backend
python tests/test_api.py
```

**Frontend:**
```bash
cd frontend
npm run test
```

## 📚 Documentation

- **Setup Guides:** `docs/setup/`
  - [AWS Setup](docs/setup/AWS_SETUP_INDIA.md)
  - [Bedrock Configuration](docs/setup/BEDROCK_SETUP.md)
  - [Phase 1 Setup](docs/setup/PHASE1_SETUP.md)

- **User Guides:** `docs/guides/`
  - [Getting Started](docs/guides/GETTING_STARTED.md)
  - [Quick Reference](docs/guides/QUICK_REFERENCE.md)

- **Troubleshooting:** `docs/troubleshooting/`
  - [Bedrock Access Issues](docs/troubleshooting/FIX_BEDROCK_ACCESS.md)
  - [Agent Role Permissions](docs/troubleshooting/FIX_AGENT_ROLE.md)

- **Spec Documentation:** `.kiro/specs/`
  - Backend API: Requirements, Design, Tasks
  - Frontend PWA: Requirements, Design, Tasks

## 🏗️ Architecture

### Backend
- **Framework:** Python 3.11, FastAPI, boto3
- **AWS Services:** Lambda, DynamoDB, Bedrock Agent Runtime
- **Region:** us-east-1 (configurable)

### Frontend
- **Framework:** React 18+, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Offline:** IndexedDB, Service Workers (Workbox)
- **Voice:** Web Speech API (Hindi + English)

### Data Sources
- **NISAR Satellite:** Soil moisture data (100m resolution) - currently mock
- **Agmarknet:** Market prices - currently mock
- **DynamoDB:** Farmer profiles, recommendations, consultations

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BEDROCK_AGENT_ID=your_agent_id
BEDROCK_AGENT_ALIAS_ID=your_alias_id
```

## 📊 API Endpoints

- `GET /` - API metadata
- `GET /health` - Health check
- `GET /farmers` - List all farmers
- `GET /farmers/{farmer_id}` - Get farmer profile
- `GET /soil-moisture/{farmer_id}` - Get soil moisture data
- `POST /crop-advice` - Get crop recommendations
- `GET /market-prices` - Get market prices
- `GET /advice/{farmer_id}` - Get complete advice (aggregated)
- `POST /chat` - Chatbot interface

## 🧪 Testing

### Backend Tests
```bash
cd backend
python tests/test_api.py        # Test all API endpoints
python tests/test_chatbot.py    # Test chatbot interface
```

### Frontend Tests
```bash
cd frontend
npm run test                     # Run unit tests
npm run test:pbt                 # Run property-based tests
```

## 🚢 Deployment

### Development
- Backend: `uvicorn main:app --reload`
- Frontend: `npm run dev`

### Production
- Backend: Deploy to AWS Lambda or EC2
- Frontend: Build and deploy to S3 + CloudFront
- See `docs/setup/` for detailed deployment guides

## 🤝 Contributing

This project follows spec-driven development methodology:

1. Review specs in `.kiro/specs/`
2. Check tasks.md for implementation status
3. Follow design patterns in design.md
4. Ensure requirements are met per requirements.md

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- NASA-ISRO NISAR Mission for satellite data
- AWS Bedrock for conversational AI
- Farmers of Uttar Pradesh for inspiration

## 📞 Support

For issues and questions:
- Check `docs/troubleshooting/`
- Review spec documentation in `.kiro/specs/`
- Open an issue on GitHub

---

**Status:** 🚧 In Development
- ✅ Backend API (Phase 1 complete)
- ✅ Lambda Functions (Phase 1 complete)
- ✅ DynamoDB Tables (Phase 1 complete)
- 🚧 Frontend PWA (In progress)
- ⏳ Bedrock Agent (Manual setup required)
