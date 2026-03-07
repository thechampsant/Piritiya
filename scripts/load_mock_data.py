#!/usr/bin/env python3
"""
Load mock data into DynamoDB tables
Run: python scripts/load_mock_data.py
"""

import boto3
import json
import sys
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

def load_json_file(filepath):
    """Load JSON file and convert floats to Decimal for DynamoDB"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f, parse_float=Decimal)
    return data

def load_farmers_data(data):
    """Load farmer profiles into Farmers table"""
    table = dynamodb.Table('Farmers')
    count = 0
    
    print("Loading farmer profiles...")
    for farmer in data['farmers']:
        item = {
            'farmer_id': farmer['farmer_id'],
            'farmer_name': farmer['farmer_name'],
            'location': farmer['location'],
            'land_details': farmer['land_details'],
            'phone_number': farmer['phone_number'],
            'preferred_language': farmer['preferred_language'],
            'registration_date': farmer['registration_date']
        }
        
        try:
            table.put_item(Item=item)
            print(f"  ✓ Loaded farmer: {farmer['farmer_id']}")
            count += 1
        except Exception as e:
            print(f"  ✗ Error loading {farmer['farmer_id']}: {e}")
    
    print(f"✓ Loaded {count} farmers\n")
    return count

def load_nisar_data(data):
    """Load NISAR data into NISARData table"""
    table = dynamodb.Table('NISARData')
    count = 0
    
    print("Loading NISAR data...")
    for farmer in data['farmers']:
        location_block = f"{farmer['location']['district']}-{farmer['location']['block']}"
        
        item = {
            'location_block': location_block,
            'measurement_date': farmer['nisar_data']['measurement_date'],
            'farmer_id': farmer['farmer_id'],
            'moisture_index': farmer['nisar_data']['moisture_index'],
            'moisture_category': farmer['nisar_data']['moisture_category'],
            'trend': farmer['nisar_data']['trend'],
            'groundwater_status': farmer['groundwater_status'],
            's3_raw_data_path': f"s3://piritiya-data/nisar/2026/02/27/{location_block}.tif",
            'ttl': int(datetime(2026, 3, 29).timestamp())  # 30 days from now
        }
        
        try:
            table.put_item(Item=item)
            print(f"  ✓ Loaded NISAR data: {location_block}")
            count += 1
        except Exception as e:
            print(f"  ✗ Error loading NISAR data for {location_block}: {e}")
    
    print(f"✓ Loaded {count} NISAR records\n")
    return count

def load_crop_recommendations(data):
    """Load crop recommendations into CropRecommendations table"""
    table = dynamodb.Table('CropRecommendations')
    count = 0
    
    print("Loading crop recommendations...")
    for farmer in data['farmers']:
        item = {
            'farmer_id': farmer['farmer_id'],
            'season': farmer['current_season'],
            'recommended_crops': farmer['recommended_crops'],
            'crops_to_avoid': farmer['crops_to_avoid'],
            'last_updated': datetime.now().isoformat()
        }
        
        try:
            table.put_item(Item=item)
            print(f"  ✓ Loaded recommendations: {farmer['farmer_id']}")
            count += 1
        except Exception as e:
            print(f"  ✗ Error loading recommendations for {farmer['farmer_id']}: {e}")
    
    print(f"✓ Loaded {count} crop recommendations\n")
    return count

def load_sample_consultations(data):
    """Load sample consultation history"""
    table = dynamodb.Table('Consultations')
    count = 0
    
    print("Loading sample consultations...")
    
    # Sample consultation for first farmer
    farmer = data['farmers'][0]
    item = {
        'farmer_id': farmer['farmer_id'],
        'timestamp': farmer['last_consultation_date'],
        'consultation_id': 'CONS-2026-02-25-001',
        'query_text': 'Kya main garmi mein dhan laga sakta hoon?',
        'response_text': 'आपके क्षेत्र में भूजल स्तर गंभीर है और मिट्टी की नमी केवल 35% है। गर्मी में धान लगाने से भूजल और कम हो जाएगा।',
        'data_sources_used': ['NISAR', 'DynamoDB'],
        'recommendation_type': 'crop_advisory',
        'session_id': 'SESSION-001',
        'response_time_ms': 4200
    }
    
    try:
        table.put_item(Item=item)
        print(f"  ✓ Loaded consultation: {item['consultation_id']}")
        count += 1
    except Exception as e:
        print(f"  ✗ Error loading consultation: {e}")
    
    print(f"✓ Loaded {count} consultations\n")
    return count

def main():
    """Load all mock data"""
    print("Loading mock data into DynamoDB...\n")
    
    try:
        # Load farm data
        data = load_json_file('data/farm_data.json')
        
        # Load into tables
        farmers_count = load_farmers_data(data)
        nisar_count = load_nisar_data(data)
        recommendations_count = load_crop_recommendations(data)
        consultations_count = load_sample_consultations(data)
        
        print("=" * 50)
        print("Summary:")
        print(f"  Farmers: {farmers_count}")
        print(f"  NISAR records: {nisar_count}")
        print(f"  Crop recommendations: {recommendations_count}")
        print(f"  Consultations: {consultations_count}")
        print("=" * 50)
        print("\n✓ All mock data loaded successfully!")
        print("\nNext steps:")
        print("1. Verify data in AWS Console: https://console.aws.amazon.com/dynamodb")
        print("2. Create Lambda functions: cd lambda_functions")
        
        return 0
        
    except FileNotFoundError:
        print("✗ Error: data/farm_data.json not found")
        print("Make sure you're running from the project root directory")
        return 1
    except Exception as e:
        print(f"✗ Error loading data: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
