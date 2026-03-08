#!/usr/bin/env python3
"""
Test script for Piritiya API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url, method="GET", data=None):
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=data)
        
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.json()
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("="*60)
    print("Piritiya API Test Suite")
    print("="*60)
    
    # Test root
    test_endpoint("Root", f"{BASE_URL}/")
    
    # Test health
    test_endpoint("Health Check", f"{BASE_URL}/health")
    
    # Test farmers list
    test_endpoint("List Farmers", f"{BASE_URL}/farmers")
    
    # Test specific farmer
    test_endpoint("Get Farmer F001", f"{BASE_URL}/farmers/F001")
    
    # Test soil moisture
    test_endpoint("Soil Moisture for F001", f"{BASE_URL}/soil-moisture/F001")
    
    # Test crop advice
    test_endpoint(
        "Crop Advice for F001",
        f"{BASE_URL}/crop-advice",
        method="POST",
        data={"farmer_id": "F001"}
    )
    
    # Test market prices
    test_endpoint("Market Prices", f"{BASE_URL}/market-prices")
    
    # Test complete advice
    test_endpoint("Complete Advice for F001", f"{BASE_URL}/advice/F001")
    
    print("\n" + "="*60)
    print("✓ All tests completed!")
    print("="*60)

if __name__ == "__main__":
    main()
