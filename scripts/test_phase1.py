#!/usr/bin/env python3
"""
Test script for Phase 1 components
Run: python scripts/test_phase1.py
"""

import boto3
import json
import sys
from botocore.exceptions import ClientError

# Initialize clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
lambda_client = boto3.client('lambda', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')

def test_dynamodb_tables():
    """Test if all DynamoDB tables exist and have data"""
    print("Testing DynamoDB tables...")
    
    tables = ['Farmers', 'NISARData', 'CropRecommendations', 'Consultations']
    results = []
    
    for table_name in tables:
        try:
            table = dynamodb.Table(table_name)
            response = table.scan(Limit=1)
            item_count = response.get('Count', 0)
            
            if item_count > 0:
                print(f"  ✓ {table_name}: Table exists with data")
                results.append(True)
            else:
                print(f"  ⚠ {table_name}: Table exists but no data")
                results.append(False)
        except ClientError as e:
            print(f"  ✗ {table_name}: {e}")
            results.append(False)
    
    return all(results)

def test_s3_buckets():
    """Test if S3 buckets exist"""
    print("\nTesting S3 buckets...")
    
    buckets = ['piritiya-data', 'piritiya-knowledge-base']
    results = []
    
    for bucket_name in buckets:
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print(f"  ✓ {bucket_name}: Bucket exists")
            results.append(True)
        except ClientError as e:
            print(f"  ✗ {bucket_name}: {e}")
            results.append(False)
    
    return all(results)

def test_lambda_functions():
    """Test if Lambda functions exist and can be invoked"""
    print("\nTesting Lambda functions...")
    
    functions = [
        {
            'name': 'get-soil-moisture',
            'payload': {'farmer_id': 'UP-LUCKNOW-MALIHABAD-00001'}
        },
        {
            'name': 'get-crop-advice',
            'payload': {'farmer_id': 'UP-LUCKNOW-MALIHABAD-00001', 'season': 'Zaid (Summer)'}
        },
        {
            'name': 'get-market-prices',
            'payload': {'crop_names': ['Moong', 'Urad'], 'district': 'Lucknow'}
        }
    ]
    
    results = []
    
    for func in functions:
        try:
            response = lambda_client.invoke(
                FunctionName=func['name'],
                InvocationType='RequestResponse',
                Payload=json.dumps(func['payload'])
            )
            
            payload = json.loads(response['Payload'].read())
            
            if payload.get('statusCode') == 200:
                print(f"  ✓ {func['name']}: Function works correctly")
                results.append(True)
            else:
                print(f"  ✗ {func['name']}: Function returned error: {payload}")
                results.append(False)
                
        except ClientError as e:
            print(f"  ✗ {func['name']}: {e}")
            results.append(False)
    
    return all(results)

def test_farmer_data():
    """Test if specific farmer data can be retrieved"""
    print("\nTesting farmer data retrieval...")
    
    try:
        table = dynamodb.Table('Farmers')
        response = table.get_item(Key={'farmer_id': 'UP-LUCKNOW-MALIHABAD-00001'})
        
        if 'Item' in response:
            farmer = response['Item']
            print(f"  ✓ Retrieved farmer: {farmer['farmer_name']}")
            print(f"    Location: {farmer['location']['village']}, {farmer['location']['block']}")
            print(f"    Land: {farmer['land_details']['total_area_hectares']} hectares")
            return True
        else:
            print("  ✗ Farmer not found")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Phase 1 Component Tests")
    print("=" * 60)
    print()
    
    results = {
        'DynamoDB Tables': test_dynamodb_tables(),
        'S3 Buckets': test_s3_buckets(),
        'Lambda Functions': test_lambda_functions(),
        'Farmer Data': test_farmer_data()
    }
    
    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    print()
    
    if all(results.values()):
        print("✓ All tests passed! Phase 1 is complete.")
        print()
        print("Next steps:")
        print("1. Review PHASE1_SETUP.md for verification checklist")
        print("2. Proceed to Phase 2: FastAPI Backend")
        return 0
    else:
        print("✗ Some tests failed. Please review errors above.")
        print()
        print("Troubleshooting:")
        print("1. Ensure AWS credentials are configured: aws configure")
        print("2. Check if tables exist: aws dynamodb list-tables")
        print("3. Verify Lambda functions: aws lambda list-functions")
        print("4. Review PHASE1_SETUP.md for detailed instructions")
        return 1

if __name__ == "__main__":
    sys.exit(main())
