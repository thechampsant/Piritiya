#!/usr/bin/env python3
"""
Create DynamoDB tables for Piritiya
Run: python scripts/create_dynamodb_tables.py
"""

import boto3
import sys
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.client('dynamodb', region_name='us-east-1')

def create_farmers_table():
    """Create Farmers table"""
    try:
        response = dynamodb.create_table(
            TableName='Farmers',
            KeySchema=[
                {'AttributeName': 'farmer_id', 'KeyType': 'HASH'}  # Partition key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'farmer_id', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST',  # On-demand billing
            Tags=[
                {'Key': 'Project', 'Value': 'Piritiya'},
                {'Key': 'Environment', 'Value': 'Development'}
            ]
        )
        print(f"✓ Created Farmers table: {response['TableDescription']['TableArn']}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("✓ Farmers table already exists")
            return True
        else:
            print(f"✗ Error creating Farmers table: {e}")
            return False

def create_nisar_data_table():
    """Create NISARData table"""
    try:
        response = dynamodb.create_table(
            TableName='NISARData',
            KeySchema=[
                {'AttributeName': 'location_block', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'measurement_date', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'location_block', 'AttributeType': 'S'},
                {'AttributeName': 'measurement_date', 'AttributeType': 'S'},
                {'AttributeName': 'farmer_id', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'FarmerIdIndex',
                    'KeySchema': [
                        {'AttributeName': 'farmer_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            BillingMode='PAY_PER_REQUEST',
            Tags=[
                {'Key': 'Project', 'Value': 'Piritiya'},
                {'Key': 'Environment', 'Value': 'Development'}
            ]
        )
        print(f"✓ Created NISARData table: {response['TableDescription']['TableArn']}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("✓ NISARData table already exists")
            return True
        else:
            print(f"✗ Error creating NISARData table: {e}")
            return False

def create_crop_recommendations_table():
    """Create CropRecommendations table"""
    try:
        response = dynamodb.create_table(
            TableName='CropRecommendations',
            KeySchema=[
                {'AttributeName': 'farmer_id', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'season', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'farmer_id', 'AttributeType': 'S'},
                {'AttributeName': 'season', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST',
            Tags=[
                {'Key': 'Project', 'Value': 'Piritiya'},
                {'Key': 'Environment', 'Value': 'Development'}
            ]
        )
        print(f"✓ Created CropRecommendations table: {response['TableDescription']['TableArn']}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("✓ CropRecommendations table already exists")
            return True
        else:
            print(f"✗ Error creating CropRecommendations table: {e}")
            return False

def create_consultations_table():
    """Create Consultations table"""
    try:
        response = dynamodb.create_table(
            TableName='Consultations',
            KeySchema=[
                {'AttributeName': 'farmer_id', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'farmer_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'S'},
                {'AttributeName': 'consultation_id', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'ConsultationIdIndex',
                    'KeySchema': [
                        {'AttributeName': 'consultation_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            BillingMode='PAY_PER_REQUEST',
            Tags=[
                {'Key': 'Project', 'Value': 'Piritiya'},
                {'Key': 'Environment', 'Value': 'Development'}
            ]
        )
        print(f"✓ Created Consultations table: {response['TableDescription']['TableArn']}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("✓ Consultations table already exists")
            return True
        else:
            print(f"✗ Error creating Consultations table: {e}")
            return False

def main():
    """Create all DynamoDB tables"""
    print("Creating DynamoDB tables for Piritiya...\n")
    
    results = [
        create_farmers_table(),
        create_nisar_data_table(),
        create_crop_recommendations_table(),
        create_consultations_table()
    ]
    
    if all(results):
        print("\n✓ All tables created successfully!")
        print("\nNext steps:")
        print("1. Run: python scripts/load_mock_data.py")
        print("2. Verify tables in AWS Console: https://console.aws.amazon.com/dynamodb")
        return 0
    else:
        print("\n✗ Some tables failed to create. Check errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
