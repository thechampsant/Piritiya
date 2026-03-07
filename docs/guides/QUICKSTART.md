# Piritiya - Quick Start Guide

Get Piritiya Phase 1 up and running in 30 minutes!

## Prerequisites (5 minutes)

1. **AWS Account**: Sign up at https://aws.amazon.com
2. **AWS CLI**: Install from https://aws.amazon.com/cli/
3. **Python 3.11+**: Download from https://python.org
4. **boto3**: Install with `pip install boto3`

**Note:** This guide uses **ap-south-1 (Mumbai)** region for optimal performance in India. See [AWS_SETUP_INDIA.md](AWS_SETUP_INDIA.md) for region-specific details.

## Quick Setup (25 minutes)

### Step 1: Configure AWS (2 minutes)

```bash
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: ap-south-1
# Default output format: json
```

### Step 2: Enable Bedrock (3 minutes)

1. Go to https://ap-south-1.console.aws.amazon.com/bedrock (Mumbai region)
2. Click "Model access" → "Manage model access"
3. Enable "Claude 3.5 Sonnet" and "Titan Embeddings V2"
4. Click "Save changes"
5. Wait 2-3 minutes for access approval

**Note:** Bedrock is available in ap-south-1 (Mumbai) for lower latency in India.

### Step 3: Create Infrastructure (5 minutes)

```bash
# Clone or navigate to project directory
cd piritiya

# Create S3 buckets in Mumbai region
aws s3 mb s3://piritiya-data --region ap-south-1
aws s3 mb s3://piritiya-knowledge-base --region ap-south-1

# Create DynamoDB tables (automatically uses ap-south-1)
python scripts/create_dynamodb_tables.py
```

### Step 4: Load Mock Data (2 minutes)

```bash
# Load farmer profiles and NISAR data
python scripts/load_mock_data.py
```

### Step 5: Deploy Lambda Functions (10 minutes)

```bash
# Deploy all Lambda functions
chmod +x lambda_functions/deploy.sh
./lambda_functions/deploy.sh
```

### Step 6: Test Everything (3 minutes)

```bash
# Run comprehensive tests
python scripts/test_phase1.py
```

Expected output:
```
============================================================
Phase 1 Component Tests
============================================================

Testing DynamoDB tables...
  ✓ Farmers: Table exists with data
  ✓ NISARData: Table exists with data
  ✓ CropRecommendations: Table exists with data
  ✓ Consultations: Table exists with data

Testing S3 buckets...
  ✓ piritiya-data: Bucket exists
  ✓ piritiya-knowledge-base: Bucket exists

Testing Lambda functions...
  ✓ get-soil-moisture: Function works correctly
  ✓ get-crop-advice: Function works correctly
  ✓ get-market-prices: Function works correctly

Testing farmer data retrieval...
  ✓ Retrieved farmer: राम प्रसाद वर्मा
    Location: Nagram, Malihabad
    Land: 2.5 hectares

============================================================
Test Summary
============================================================
DynamoDB Tables: ✓ PASS
S3 Buckets: ✓ PASS
Lambda Functions: ✓ PASS
Farmer Data: ✓ PASS

✓ All tests passed! Phase 1 is complete.
```

## What You've Built

After completing these steps, you have:

✅ **AWS Infrastructure**
- 2 S3 buckets for data storage
- 4 DynamoDB tables with mock data
- IAM roles with proper permissions

✅ **Data Layer**
- 3 farmer profiles (Lucknow, Kanpur, Varanasi)
- NISAR soil moisture data
- Crop recommendations
- Sample consultation history

✅ **Serverless Functions**
- `get-soil-moisture`: Fetches soil data
- `get-crop-advice`: Provides recommendations
- `get-market-prices`: Returns market prices

## Quick Test

Test a Lambda function manually:

```bash
# Test soil moisture function
aws lambda invoke \
    --function-name get-soil-moisture \
    --payload '{"farmer_id":"UP-LUCKNOW-MALIHABAD-00001"}' \
    output.json && cat output.json
```

## Next Steps

Now that Phase 1 is complete, you can:

1. **Phase 2**: Build FastAPI backend
   - Set up Python FastAPI project
   - Integrate with Bedrock Agent
   - Create REST API endpoints

2. **Phase 3**: Build PWA Frontend
   - Create React/Next.js app
   - Implement offline-first features
   - Add voice input/output

3. **Phase 4**: Integration & Deployment
   - End-to-end testing
   - Performance optimization
   - Production deployment

## Troubleshooting

### AWS CLI not working?
```bash
aws --version
# If not found, reinstall AWS CLI
```

### Bedrock access denied?
- Wait 5 minutes after enabling model access
- Check your AWS region (must be ap-south-1 for India)
- Note: Bedrock is available in ap-south-1 (Mumbai)

### Lambda deployment fails?
```bash
# Check Python version
python --version  # Should be 3.11+

# Install boto3
pip install boto3
```

### DynamoDB tables not created?
```bash
# Check if tables exist
aws dynamodb list-tables

# Delete and recreate if needed
aws dynamodb delete-table --table-name Farmers
python scripts/create_dynamodb_tables.py
```

## Cost Estimate

Phase 1 development costs (per day):
- DynamoDB: $0 (free tier)
- S3: $0.01
- Lambda: $0 (free tier)
- **Total: ~$0.01/day**

## Support

Need help? Check:
- [PHASE1_SETUP.md](PHASE1_SETUP.md) - Detailed setup guide
- [README.md](README.md) - Full project documentation
- AWS Documentation - https://docs.aws.amazon.com

## Congratulations! 🎉

You've successfully completed Phase 1 of Piritiya!

Your serverless backend is ready to:
- Fetch real-time soil moisture data
- Provide sustainable crop recommendations
- Return market prices for crops

Ready to build the API layer? Let's move to Phase 2!
