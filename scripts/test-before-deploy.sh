#!/bin/bash

# Piritiya Pre-Deployment Test Script
# Run this before deploying to production to verify everything works locally

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Test 1: Check AWS infrastructure
test_aws_infrastructure() {
    print_header "Test 1: AWS Infrastructure"
    
    print_info "Checking DynamoDB tables..."
    TABLES=$(aws dynamodb list-tables --region us-east-1 --query 'TableNames' --output text)
    
    for table in "Farmers" "NISARData" "CropRecommendations" "Consultations"; do
        if echo "$TABLES" | grep -q "$table"; then
            print_success "$table table exists"
        else
            print_error "$table table not found"
            return 1
        fi
    done
    
    print_info "Checking Lambda functions..."
    FUNCTIONS=$(aws lambda list-functions --region us-east-1 --query 'Functions[].FunctionName' --output text)
    
    for func in "get-soil-moisture" "get-crop-advice" "get-market-prices"; do
        if echo "$FUNCTIONS" | grep -q "$func"; then
            print_success "$func function exists"
        else
            print_error "$func function not found"
            return 1
        fi
    done
    
    print_info "Checking S3 buckets..."
    BUCKETS=$(aws s3 ls | grep piritiya)
    
    for bucket in "piritiya-data" "piritiya-knowledge-base" "piritiya-transcribe"; do
        if echo "$BUCKETS" | grep -q "$bucket"; then
            print_success "$bucket bucket exists"
        else
            print_error "$bucket bucket not found"
            return 1
        fi
    done
    
    print_success "All AWS infrastructure verified"
}

# Test 2: Check backend code
test_backend_code() {
    print_header "Test 2: Backend Code"
    
    print_info "Checking backend files..."
    
    if [ ! -f "backend/main.py" ]; then
        print_error "backend/main.py not found"
        return 1
    fi
    print_success "backend/main.py exists"
    
    if [ ! -f "backend/lambda_handler.py" ]; then
        print_error "backend/lambda_handler.py not found"
        return 1
    fi
    print_success "backend/lambda_handler.py exists"
    
    if [ ! -f "backend/Dockerfile.lambda" ]; then
        print_error "backend/Dockerfile.lambda not found"
        return 1
    fi
    print_success "backend/Dockerfile.lambda exists"
    
    if [ ! -f "backend/requirements-lambda.txt" ]; then
        print_error "backend/requirements-lambda.txt not found"
        return 1
    fi
    print_success "backend/requirements-lambda.txt exists"
    
    print_info "Checking .env configuration..."
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        return 1
    fi
    
    # Check required env vars
    source .env
    for var in "AWS_REGION" "BEDROCK_AGENT_ID" "BEDROCK_AGENT_ALIAS_ID" "AWS_TRANSCRIBE_BUCKET"; do
        if [ -z "${!var}" ]; then
            print_error "$var not set in .env"
            return 1
        fi
    done
    print_success ".env configured correctly"
}

# Test 3: Check frontend code
test_frontend_code() {
    print_header "Test 3: Frontend Code"
    
    print_info "Checking frontend files..."
    
    if [ ! -f "frontend/package.json" ]; then
        print_error "frontend/package.json not found"
        return 1
    fi
    print_success "frontend/package.json exists"
    
    if [ ! -d "frontend/src" ]; then
        print_error "frontend/src directory not found"
        return 1
    fi
    print_success "frontend/src directory exists"
    
    if [ ! -f "frontend/vite.config.ts" ]; then
        print_error "frontend/vite.config.ts not found"
        return 1
    fi
    print_success "frontend/vite.config.ts exists"
    
    print_info "Checking frontend dependencies..."
    if [ ! -d "frontend/node_modules" ]; then
        print_error "frontend/node_modules not found. Run: cd frontend && npm install"
        return 1
    fi
    print_success "frontend dependencies installed"
}

# Test 4: Build backend Docker image
test_backend_build() {
    print_header "Test 4: Backend Docker Build"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        print_info "Skipping Docker build test..."
        return 1
    fi
    
    print_info "Building Lambda Docker image (this may take a few minutes)..."
    
    if docker build -f backend/Dockerfile.lambda -t piritiya-api-lambda-test backend; then
        print_success "Backend Docker image built successfully"
        
        # Clean up test image
        docker rmi piritiya-api-lambda-test &> /dev/null || true
    else
        print_error "Backend Docker build failed"
        return 1
    fi
}

# Test 5: Build frontend
test_frontend_build() {
    print_header "Test 5: Frontend Build"
    
    print_info "Building frontend (this may take a minute)..."
    
    cd frontend
    if VITE_API_BASE_URL=https://test.example.com npm run build; then
        print_success "Frontend built successfully"
        
        # Check dist directory
        if [ -d "dist" ] && [ -f "dist/index.html" ]; then
            print_success "dist/index.html exists"
        else
            print_error "dist/index.html not found"
            cd ..
            return 1
        fi
    else
        print_error "Frontend build failed"
        cd ..
        return 1
    fi
    cd ..
}

# Test 6: Run backend tests
test_backend_tests() {
    print_header "Test 6: Backend Tests"
    
    print_info "Running backend tests..."
    
    if [ -d "backend/tests" ]; then
        # Check for python3 or python
        if command -v python3 &> /dev/null; then
            PYTHON_CMD="python3"
        elif command -v python &> /dev/null; then
            PYTHON_CMD="python"
        else
            print_error "Python not found. Please install Python 3.11+"
            return 1
        fi
        
        cd backend
        if $PYTHON_CMD -m pytest tests/ -v 2>/dev/null; then
            print_success "Backend tests passed"
        else
            print_info "Backend tests skipped (pytest not installed or tests failed)"
            print_info "Install with: pip install pytest"
        fi
        cd ..
    else
        print_info "No backend tests found (skipping)"
    fi
}

# Test 7: Run frontend tests
test_frontend_tests() {
    print_header "Test 7: Frontend Tests"
    
    print_info "Running frontend tests..."
    
    cd frontend
    if npm run test -- --run; then
        print_success "Frontend tests passed"
    else
        print_error "Frontend tests failed"
        cd ..
        return 1
    fi
    cd ..
}

# Main execution
main() {
    print_header "Piritiya Pre-Deployment Tests"
    print_info "Running comprehensive tests before deployment..."
    echo ""
    
    FAILED=0
    WARNINGS=0
    
    test_aws_infrastructure || FAILED=1
    test_backend_code || FAILED=1
    test_frontend_code || FAILED=1
    
    if [ "$1" != "quick" ]; then
        test_backend_build || WARNINGS=1
        test_frontend_build || FAILED=1
        test_backend_tests || WARNINGS=1
        test_frontend_tests || FAILED=1
    fi
    
    print_header "Test Summary"
    
    if [ $FAILED -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            print_success "All tests passed! Ready to deploy."
        else
            print_success "Core tests passed! Some optional tests had warnings."
            print_info "You can still deploy, but consider fixing warnings."
        fi
        echo ""
        print_info "Run deployment with:"
        echo "  ./scripts/deploy-production.sh"
        return 0
    else
        print_error "Critical tests failed. Please fix issues before deploying."
        echo ""
        print_info "Common fixes:"
        echo "  - Docker not running: Start Docker Desktop"
        echo "  - Python not found: Install Python 3.11+"
        echo "  - Frontend build failed: Check Node.js version (18+)"
        return 1
    fi
}

# Run main
main "$@"
