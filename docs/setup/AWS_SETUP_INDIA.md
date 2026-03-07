# AWS Setup for India (ap-south-1 Region)

This guide helps you set up Piritiya in the AWS Mumbai (ap-south-1) region, optimized for Indian users.

## Why ap-south-1 (Mumbai)?

✅ **Lower Latency**: Faster response times for Indian farmers  
✅ **Data Residency**: Data stays in India (compliance with local regulations)  
✅ **Cost Optimization**: Reduced data transfer costs  
✅ **Bedrock Availability**: Amazon Bedrock is available in ap-south-1  

## Region-Specific Configuration

### 1. AWS CLI Configuration

```bash
aws configure
```

**Important Settings:**
- **Default region name**: `ap-south-1` (Mumbai)
- **Default output format**: `json`

Verify configuration:
```bash
aws configure get region
# Should output: ap-south-1
```

### 2. Bedrock Model Access in ap-south-1

Amazon Bedrock is available in ap-south-1 with the following models:

**Available Models:**
- ✅ Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20241022-v2:0)
- ✅ Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
- ✅ Titan Text Embeddings V2 (amazon.titan-embed-text-v2:0)
- ✅ Titan Text Embeddings G1 (amazon.titan-embed-text-v1)

**To Enable:**
1. Go to https://ap-south-1.console.aws.amazon.com/bedrock
2. Click "Model access" in left sidebar
3. Click "Manage model access"
4. Enable:
   - Claude 3.5 Sonnet
   - Titan Text Embeddings V2
5. Click "Save changes"
6. Wait 2-3 minutes for access to be granted

### 3. S3 Buckets in ap-south-1

Create buckets in Mumbai region:

```bash
# Create data bucket
aws s3 mb s3://piritiya-data --region ap-south-1

# Create knowledge base bucket
aws s3 mb s3://piritiya-knowledge-base --region ap-south-1

# Verify buckets are in ap-south-1
aws s3api get-bucket-location --bucket piritiya-data
# Should output: {"LocationConstraint": "ap-south-1"}
```

### 4. DynamoDB in ap-south-1

DynamoDB tables will be created in ap-south-1 automatically when you run:

```bash
python scripts/create_dynamodb_tables.py
```

Verify region:
```bash
aws dynamodb describe-table --table-name Farmers --region ap-south-1
```

### 5. Lambda Functions in ap-south-1

Lambda functions will be deployed to ap-south-1:

```bash
./lambda_functions/deploy.sh
```

The script automatically uses `ap-south-1` region.

## Region-Specific Considerations

### Latency Expectations

| Service | Expected Latency (from India) |
|---------|-------------------------------|
| DynamoDB | <10ms |
| S3 | <50ms |
| Lambda | <100ms (cold start), <10ms (warm) |
| Bedrock | <2s |

### Cost Comparison

**ap-south-1 vs us-east-1 for Indian users:**

| Service | ap-south-1 | us-east-1 | Savings |
|---------|------------|-----------|---------|
| Data Transfer | ₹0 (in-region) | ₹6/GB | 100% |
| Latency | ~10ms | ~200ms | 95% faster |
| DynamoDB | Same | Same | - |
| Lambda | Same | Same | - |

**Estimated Monthly Cost (1000 farmers):**
- DynamoDB: ₹500
- S3: ₹100
- Lambda: ₹200
- Bedrock: ₹2,000
- **Total: ~₹2,800/month**

### Data Residency & Compliance

✅ **Digital Personal Data Protection Act 2023**: Data stays in India  
✅ **AgriStack Guidelines**: Compliant with Indian agricultural data norms  
✅ **RBI Guidelines**: Financial data (if any) stays in India  

## Troubleshooting

### Issue: Bedrock not available in ap-south-1

**Solution:** Bedrock IS available in ap-south-1 as of 2024. If you see errors:
1. Check model access is enabled
2. Wait 5 minutes after enabling
3. Verify you're using correct model IDs

### Issue: S3 bucket name already taken

**Solution:** S3 bucket names are globally unique. Try:
```bash
aws s3 mb s3://piritiya-data-$(date +%s) --region ap-south-1
```

### Issue: Lambda deployment fails

**Solution:** Ensure IAM role has permissions:
```bash
aws iam get-role --role-name PiritiyaLambdaExecutionRole
```

### Issue: High latency from India

**Solution:** Verify you're using ap-south-1:
```bash
aws configure get region
# Should be: ap-south-1
```

## Multi-Region Setup (Optional)

For disaster recovery, you can set up a secondary region:

**Primary:** ap-south-1 (Mumbai)  
**Secondary:** ap-southeast-1 (Singapore)

```bash
# Replicate S3 buckets
aws s3api put-bucket-replication \
  --bucket piritiya-data \
  --replication-configuration file://replication.json

# Enable DynamoDB Global Tables
aws dynamodb create-global-table \
  --global-table-name Farmers \
  --replication-group RegionName=ap-south-1 RegionName=ap-southeast-1
```

## Performance Optimization for India

### 1. CloudFront Distribution

Create CloudFront distribution for S3:
```bash
aws cloudfront create-distribution \
  --origin-domain-name piritiya-data.s3.ap-south-1.amazonaws.com \
  --default-root-object index.html
```

### 2. DynamoDB Auto Scaling

Enable auto-scaling for peak loads:
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/Farmers \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --min-capacity 5 \
  --max-capacity 100
```

### 3. Lambda Provisioned Concurrency

For consistent performance:
```bash
aws lambda put-provisioned-concurrency-config \
  --function-name get-soil-moisture \
  --provisioned-concurrent-executions 5
```

## Monitoring in ap-south-1

### CloudWatch Dashboard

Create region-specific dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name Piritiya-Mumbai \
  --dashboard-body file://dashboard.json
```

### Alarms

Set up latency alarms:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name Piritiya-High-Latency \
  --alarm-description "Alert when Lambda latency > 5s" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold
```

## Support

For region-specific issues:
- AWS Support: https://console.aws.amazon.com/support
- AWS India: https://aws.amazon.com/india/
- Bedrock Documentation: https://docs.aws.amazon.com/bedrock/

## Quick Reference

**Region Code:** ap-south-1  
**Region Name:** Asia Pacific (Mumbai)  
**Availability Zones:** 3 (aps1-az1, aps1-az2, aps1-az3)  
**Bedrock Endpoint:** https://bedrock-runtime.ap-south-1.amazonaws.com  
**DynamoDB Endpoint:** https://dynamodb.ap-south-1.amazonaws.com  
**S3 Endpoint:** https://s3.ap-south-1.amazonaws.com  

---

**Ready to deploy?** Follow the [QUICKSTART.md](QUICKSTART.md) guide with ap-south-1 configuration!
