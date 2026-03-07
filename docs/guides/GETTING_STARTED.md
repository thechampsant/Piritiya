# Getting Started with Piritiya

Quick guide to get Piritiya Phase 1 running on your Mac.

## Prerequisites

1. **AWS Account** - Sign up at https://aws.amazon.com
2. **AWS CLI** - Install: `brew install awscli`
3. **Python 3.11+** - Already installed ✓ (You have Python 3.14.2)

## Quick Setup (3 Commands)

### 1. Configure AWS

```bash
aws configure
```

Enter your credentials:
- **AWS Access Key ID**: Get from AWS Console → IAM → Users → Security credentials
- **AWS Secret Access Key**: From same place
- **Default region**: `ap-south-1` (Mumbai, India)
- **Default output format**: `json`

### 2. Run Automated Setup

```bash
./setup_phase1.sh
```

This script will:
- Create Python virtual environment
- Install dependencies (boto3)
- Create S3 buckets
- Create DynamoDB tables
- Load mock data
- Deploy Lambda functions
- Run tests

**Time:** ~5-10 minutes

### 3. Verify Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Run tests
python scripts/test_phase1.py
```

## Manual Setup (If Automated Fails)

### Step 1: Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Create Infrastructure

```bash
# Create S3 buckets
aws s3 mb s3://piritiya-data --region ap-south-1
aws s3 mb s3://piritiya-knowledge-base --region ap-south-1

# Create DynamoDB tables
python scripts/create_dynamodb_tables.py
```

### Step 3: Load Data

```bash
# Load mock farmer data
python scripts/load_mock_data.py
```

### Step 4: Deploy Lambda Functions

```bash
# Make script executable
chmod +x lambda_functions/deploy.sh

# Deploy
./lambda_functions/deploy.sh
```

### Step 5: Test

```bash
python scripts/test_phase1.py
```

## Troubleshooting

### Issue: `python: command not found`
**Solution:** Use `python3` instead of `python` on macOS

### Issue: `ModuleNotFoundError: No module named 'boto3'`
**Solution:** Activate virtual environment first
```bash
source venv/bin/activate
pip install boto3
```

### Issue: `externally-managed-environment`
**Solution:** Use virtual environment (already handled by setup script)

### Issue: AWS credentials not configured
**Solution:** Run `aws configure` and enter your credentials

### Issue: Bedrock access denied
**Solution:** 
1. Go to https://ap-south-1.console.aws.amazon.com/bedrock
2. Click "Model access" → "Manage model access"
3. Enable Claude 3.5 Sonnet
4. Wait 2-3 minutes

### Issue: S3 bucket name already taken
**Solution:** Bucket names are globally unique. Try:
```bash
aws s3 mb s3://piritiya-data-$(date +%s) --region ap-south-1
```

## What Gets Created

After successful setup:

✅ **Virtual Environment**
- `venv/` directory with Python packages

✅ **AWS Resources**
- 2 S3 buckets (piritiya-data, piritiya-knowledge-base)
- 4 DynamoDB tables (Farmers, NISARData, CropRecommendations, Consultations)
- 3 Lambda functions (get-soil-moisture, get-crop-advice, get-market-prices)
- IAM role (PiritiyaLambdaExecutionRole)

✅ **Mock Data**
- 3 farmer profiles (Lucknow, Kanpur, Varanasi)
- NISAR soil moisture data
- Crop recommendations
- Sample consultation history

## Testing Individual Components

### Test DynamoDB

```bash
# List tables
aws dynamodb list-tables

# Get a farmer
aws dynamodb get-item \
    --table-name Farmers \
    --key '{"farmer_id": {"S": "UP-LUCKNOW-MALIHABAD-00001"}}'
```

### Test Lambda Functions

```bash
# Test soil moisture function
aws lambda invoke \
    --function-name get-soil-moisture \
    --payload '{"farmer_id":"UP-LUCKNOW-MALIHABAD-00001"}' \
    output.json

# View output
cat output.json
```

### Test S3

```bash
# List buckets
aws s3 ls

# Check bucket location
aws s3api get-bucket-location --bucket piritiya-data
```

## Useful Commands

```bash
# Activate virtual environment (always do this first!)
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Update dependencies
pip install -r requirements.txt --upgrade

# View Lambda logs
aws logs tail /aws/lambda/get-soil-moisture --follow

# Delete all resources (cleanup)
aws s3 rb s3://piritiya-data --force
aws s3 rb s3://piritiya-knowledge-base --force
aws dynamodb delete-table --table-name Farmers
aws lambda delete-function --function-name get-soil-moisture
```

## Cost Estimate

Phase 1 development costs:
- **DynamoDB**: $0 (free tier)
- **S3**: $0.01/day
- **Lambda**: $0 (free tier)
- **Total**: ~₹1/day (~$0.01/day)

## Next Steps

Once Phase 1 is complete:

1. **Review Resources**: Check AWS Console
2. **Test Functions**: Try different farmer IDs
3. **Phase 2**: Build FastAPI backend
4. **Phase 3**: Build PWA frontend

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - 30-minute setup guide
- [PHASE1_SETUP.md](PHASE1_SETUP.md) - Detailed instructions
- [AWS_SETUP_INDIA.md](AWS_SETUP_INDIA.md) - India-specific AWS setup
- [README.md](README.md) - Full project documentation

## Support

Need help?
- Check [PHASE1_SETUP.md](PHASE1_SETUP.md) for detailed troubleshooting
- Review AWS CloudWatch logs for errors
- Verify IAM permissions

## Success!

If all tests pass, you're ready for Phase 2! 🎉

```
✓ All tests passed! Phase 1 is complete.

Next steps:
1. Review PHASE1_SETUP.md for verification checklist
2. Proceed to Phase 2: FastAPI Backend
```
