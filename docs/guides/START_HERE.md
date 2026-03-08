# Piritiya - Fresh Start Guide

We're starting fresh with a simpler approach: Direct Lambda invocations via FastAPI (no Bedrock complications).

## What We Have Working

✅ DynamoDB tables with farmer data  
✅ S3 buckets  
✅ Lambda functions (need to deploy remaining 2)  
✅ FastAPI backend (just created)

## Quick Start (5 minutes)

### Step 1: Deploy Remaining Lambda Functions
```bash
./lambda_functions/deploy.sh
```

### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Start the API Server
```bash
# In backend directory
python main.py
```

The API will start at `http://localhost:8000`

### Step 4: Test the API
Open a new terminal:
```bash
# Install requests if needed
pip install requests

# Run tests
python backend/test_api.py
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /farmers` - List all farmers
- `GET /farmers/{farmer_id}` - Get farmer details
- `GET /soil-moisture/{farmer_id}` - Get soil moisture data
- `POST /crop-advice` - Get crop recommendations
- `GET /market-prices` - Get market prices
- `GET /advice/{farmer_id}` - Get complete advice (all-in-one)

## Example Usage

### Get Complete Advice for a Farmer
```bash
curl http://localhost:8000/advice/F001
```

This returns:
- Soil moisture data from NISAR
- Crop recommendations
- Market prices

### Get Soil Moisture Only
```bash
curl http://localhost:8000/soil-moisture/F001
```

### Get Crop Advice
```bash
curl -X POST http://localhost:8000/crop-advice \
  -H "Content-Type: application/json" \
  -d '{"farmer_id": "F001"}'
```

## Architecture

```
Frontend (PWA)
    ↓
FastAPI Backend (port 8000)
    ↓
AWS Lambda Functions
    ↓
DynamoDB + S3
```

## What's Different from Before?

**Before:** Trying to use Bedrock Agents (permission issues)  
**Now:** Direct Lambda invocations (works immediately)

**Benefits:**
- No Bedrock permission issues
- Faster responses
- More control over logic
- Can add Bedrock later if needed

## Next Steps

1. ✅ Deploy Lambda functions
2. ✅ Test API endpoints
3. Build simple frontend (HTML/JS)
4. Add offline capabilities (PWA)
5. Deploy to production

## Troubleshooting

### Lambda functions not found
```bash
# Check if deployed
aws lambda list-functions --region ap-south-1 --query 'Functions[?starts_with(FunctionName, `get-`)].FunctionName'

# Deploy if missing
./lambda_functions/deploy.sh
```

### API can't connect to AWS
```bash
# Verify credentials
aws sts get-caller-identity

# Check .env file
cat .env
```

### Port 8000 already in use
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn backend.main:app --port 8001
```

## Testing with Browser

Open `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

Try these in the browser:
- http://localhost:8000/
- http://localhost:8000/farmers
- http://localhost:8000/advice/F001

## Ready to Start?

```bash
# 1. Deploy Lambda functions
./lambda_functions/deploy.sh

# 2. Start API
cd backend && python main.py
```

That's it! Simple and working.
