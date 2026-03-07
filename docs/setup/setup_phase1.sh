#!/bin/bash
# Phase 1 Setup Script for macOS/Linux
# This script automates the Phase 1 setup process

set -e  # Exit on error

echo "🚀 Piritiya Phase 1 Setup"
echo "=========================="
echo ""

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python not found. Please install Python 3.11+"
    exit 1
fi

echo "✓ Using Python: $PYTHON_CMD ($($PYTHON_CMD --version))"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --quiet --upgrade
echo "✓ Dependencies installed"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI not found"
    echo "Install from: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✓ AWS CLI found: $(aws --version)"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✓ AWS credentials configured"
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
echo "  Account: $AWS_ACCOUNT"
echo "  Region: $AWS_REGION"
echo ""

# Verify region is ap-south-1
if [ "$AWS_REGION" != "ap-south-1" ]; then
    echo "⚠️  Warning: Current region is $AWS_REGION"
    echo "   Recommended region for India: ap-south-1"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Run: aws configure"
        echo "Set region to: ap-south-1"
        exit 1
    fi
fi

# Step 1: Create S3 Buckets
echo "Step 1: Creating S3 Buckets..."
echo "------------------------------"

if aws s3 ls s3://piritiya-data 2>/dev/null; then
    echo "✓ Bucket piritiya-data already exists"
else
    aws s3 mb s3://piritiya-data --region ap-south-1
    echo "✓ Created bucket: piritiya-data"
fi

if aws s3 ls s3://piritiya-knowledge-base 2>/dev/null; then
    echo "✓ Bucket piritiya-knowledge-base already exists"
else
    aws s3 mb s3://piritiya-knowledge-base --region ap-south-1
    echo "✓ Created bucket: piritiya-knowledge-base"
fi
echo ""

# Step 2: Create DynamoDB Tables
echo "Step 2: Creating DynamoDB Tables..."
echo "-----------------------------------"
python scripts/create_dynamodb_tables.py
echo ""

# Step 3: Load Mock Data
echo "Step 3: Loading Mock Data..."
echo "----------------------------"
python scripts/load_mock_data.py
echo ""

# Step 4: Deploy Lambda Functions
echo "Step 4: Deploying Lambda Functions..."
echo "-------------------------------------"
echo "This may take 2-3 minutes..."
echo ""

# Make deploy script executable
chmod +x lambda_functions/deploy.sh

# Deploy Lambda functions
./lambda_functions/deploy.sh

echo ""
echo "Step 5: Running Tests..."
echo "------------------------"
python scripts/test_phase1.py

echo ""
echo "================================================"
echo "✅ Phase 1 Setup Complete!"
echo "================================================"
echo ""
echo "What was created:"
echo "  • Virtual environment (venv/)"
echo "  • 2 S3 buckets (piritiya-data, piritiya-knowledge-base)"
echo "  • 4 DynamoDB tables (Farmers, NISARData, CropRecommendations, Consultations)"
echo "  • 3 Lambda functions (get-soil-moisture, get-crop-advice, get-market-prices)"
echo "  • Mock data loaded (3 farmers, NISAR data, recommendations)"
echo ""
echo "Next steps:"
echo "  1. Review AWS Console to see your resources"
echo "  2. Test Lambda functions manually"
echo "  3. Proceed to Phase 2: FastAPI Backend"
echo ""
echo "Useful commands:"
echo "  • Activate venv: source venv/bin/activate"
echo "  • List tables: aws dynamodb list-tables"
echo "  • List buckets: aws s3 ls"
echo "  • List functions: aws lambda list-functions"
echo "  • Test function: aws lambda invoke --function-name get-soil-moisture output.json"
echo ""
