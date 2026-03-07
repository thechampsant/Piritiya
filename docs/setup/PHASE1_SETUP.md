# Phase 1: Foundation & Backend Core - Setup Guide

This guide will help you complete Phase 1 (Days 1-7) of the Piritiya implementation.

## Prerequisites

Before starting, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Python 3.11+ installed
- [ ] Bedrock access enabled in your AWS account
- [ ] boto3 installed: `pip install boto3`

## Day 1-2: AWS Infrastructure Setup

### Step 1: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: ap-south-1 (Mumbai, India)
# Default output format: json
```

### Step 2: Enable Amazon Bedrock

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Enable access to:
   - Claude 3.5 Sonnet
   - Titan Embeddings G1 - Text

### Step 3: Create S3 Buckets

```bash
# Create bucket for NISAR data
aws s3 mb s3://piritiya-data --region ap-south-1

# Create bucket for government scheme PDFs
aws s3 mb s3://piritiya-knowledge-base --region ap-south-1

# Verify buckets created
aws s3 ls
```

### Step 4: Create DynamoDB Tables

```bash
# Run the table creation script
python scripts/create_dynamodb_tables.py
```

Expected output:
```
Creating DynamoDB tables for Piritiya...

✓ Created Farmers table: arn:aws:dynamodb:...
✓ Created NISARData table: arn:aws:dynamodb:...
✓ Created CropRecommendations table: arn:aws:dynamodb:...
✓ Created Consultations table: arn:aws:dynamodb:...

✓ All tables created successfully!
```

### Step 5: Verify Tables

```bash
# List all tables
aws dynamodb list-tables

# Describe a specific table
aws dynamodb describe-table --table-name Farmers
```

---

## Day 3-4: Mock Data Creation

### Step 1: Review Mock Data

The mock data is already created in `data/farm_data.json`. It includes:
- 3 farmer profiles (Lucknow, Kanpur, Varanasi)
- NISAR soil moisture data
- Groundwater status
- Crop recommendations
- Varied scenarios (Critical, Moderate groundwater)

### Step 2: Load Mock Data into DynamoDB

```bash
# Load all mock data
python scripts/load_mock_data.py
```

Expected output:
```
Loading mock data into DynamoDB...

Loading farmer profiles...
  ✓ Loaded farmer: UP-LUCKNOW-MALIHABAD-00001
  ✓ Loaded farmer: UP-KANPUR-GHATAMPUR-00002
  ✓ Loaded farmer: UP-VARANASI-PINDRA-00003
✓ Loaded 3 farmers

Loading NISAR data...
  ✓ Loaded NISAR data: Lucknow-Malihabad
  ✓ Loaded NISAR data: Kanpur-Ghatampur
  ✓ Loaded NISAR data: Varanasi-Pindra
✓ Loaded 3 NISAR records

...

✓ All mock data loaded successfully!
```

### Step 3: Verify Data in DynamoDB

```bash
# Query a farmer
aws dynamodb get-item \
    --table-name Farmers \
    --key '{"farmer_id": {"S": "UP-LUCKNOW-MALIHABAD-00001"}}'

# Query NISAR data
aws dynamodb query \
    --table-name NISARData \
    --key-condition-expression "location_block = :loc" \
    --expression-attribute-values '{":loc": {"S": "Lucknow-Malihabad"}}'
```

### Step 4: Add More Farmers (Optional)

Edit `data/farm_data.json` to add more farmer profiles, then re-run:
```bash
python scripts/load_mock_data.py
```

---

## Day 5-7: Lambda Functions

### Step 1: Review Lambda Functions

Three Lambda functions are created:

1. **get-soil-moisture** (`lambda_functions/get_soil_moisture/`)
   - Fetches soil moisture data from DynamoDB
   - Returns moisture index, groundwater status

2. **get-crop-advice** (`lambda_functions/get_crop_advice/`)
   - Provides crop recommendations
   - Generates reasoning in Hindi

3. **get-market-prices** (`lambda_functions/get_market_prices/`)
   - Returns mock market prices
   - Simulates Agmarknet API

### Step 2: Deploy Lambda Functions

```bash
# Deploy all functions at once
./lambda_functions/deploy.sh
```

This script will:
- Create IAM role with necessary permissions
- Package each Lambda function with dependencies
- Deploy to AWS Lambda
- Configure timeout and memory settings

### Step 3: Test Lambda Functions

#### Test get-soil-moisture:

```bash
# Create test event
cat > test_event.json <<EOF
{
  "farmer_id": "UP-LUCKNOW-MALIHABAD-00001"
}
EOF

# Invoke function
aws lambda invoke \
    --function-name get-soil-moisture \
    --payload file://test_event.json \
    output.json

# View output
cat output.json
```

Expected output:
```json
{
  "statusCode": 200,
  "body": "{\"moisture_index\": 35, \"moisture_category\": \"Low\", ...}"
}
```

#### Test get-crop-advice:

```bash
cat > test_event.json <<EOF
{
  "farmer_id": "UP-LUCKNOW-MALIHABAD-00001",
  "season": "Zaid (Summer)"
}
EOF

aws lambda invoke \
    --function-name get-crop-advice \
    --payload file://test_event.json \
    output.json

cat output.json
```

#### Test get-market-prices:

```bash
cat > test_event.json <<EOF
{
  "crop_names": ["Moong", "Urad"],
  "district": "Lucknow"
}
EOF

aws lambda invoke \
    --function-name get-market-prices \
    --payload file://test_event.json \
    output.json

cat output.json
```

### Step 4: View Lambda Logs

```bash
# View logs for get-soil-moisture
aws logs tail /aws/lambda/get-soil-moisture --follow

# View logs for get-crop-advice
aws logs tail /aws/lambda/get-crop-advice --follow

# View logs for get-market-prices
aws logs tail /aws/lambda/get-market-prices --follow
```

---

## Verification Checklist

After completing Phase 1, verify:

- [ ] AWS CLI configured and working
- [ ] Bedrock access enabled (Claude 3.5 Sonnet)
- [ ] 2 S3 buckets created (piritiya-data, piritiya-knowledge-base)
- [ ] 4 DynamoDB tables created (Farmers, NISARData, CropRecommendations, Consultations)
- [ ] Mock data loaded (3 farmers, 3 NISAR records, 3 recommendations)
- [ ] 3 Lambda functions deployed and tested
- [ ] All Lambda functions return successful responses

## Troubleshooting

### Issue: AWS CLI not configured
```bash
aws configure
# Enter your credentials
```

### Issue: Bedrock access denied
- Go to AWS Console → Bedrock → Model access
- Request access to Claude 3.5 Sonnet
- Wait for approval (usually instant)

### Issue: DynamoDB table already exists
- This is fine! The script will skip creation
- Or delete and recreate: `aws dynamodb delete-table --table-name Farmers`

### Issue: Lambda deployment fails
- Check IAM permissions
- Ensure Python 3.11 is installed
- Verify boto3 is installed: `pip install boto3`

### Issue: Lambda function times out
- Increase timeout: `aws lambda update-function-configuration --function-name get-soil-moisture --timeout 30`

---

## Cost Estimate (Phase 1)

Estimated AWS costs for Phase 1 development:

- DynamoDB: $0 (free tier covers development)
- S3: $0.01 (minimal storage)
- Lambda: $0 (free tier covers 1M requests)
- Bedrock: $0 (no usage yet)

**Total: ~$0.01/day**

---

## Next Steps

Once Phase 1 is complete, proceed to:

**Phase 2: FastAPI Backend (Week 2)**
- Set up FastAPI project
- Implement Bedrock Agent integration
- Create REST API endpoints
- Configure Celery for background tasks

---

## Support

If you encounter issues:

1. Check AWS CloudWatch logs
2. Verify IAM permissions
3. Review error messages in terminal
4. Check AWS service quotas

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
