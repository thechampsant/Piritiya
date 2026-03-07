#!/usr/bin/env python3
"""
Test the chatbot endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_chat(message, session_id=None):
    print(f"\n{'='*60}")
    print(f"User: {message}")
    print('='*60)
    
    params = {"message": message}
    if session_id:
        params["session_id"] = session_id
    
    try:
        response = requests.post(f"{BASE_URL}/chat", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Agent: {data['response']}")
            print(f"Session ID: {data['session_id']}")
            return data['session_id']
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("="*60)
    print("Piritiya Chatbot Test")
    print("="*60)
    
    # Test 1: Ask about soil moisture
    session = test_chat("What is the soil moisture for farmer UP-LUCKNOW-MALIHABAD-00001?")
    
    # Test 2: Follow-up question (same session)
    if session:
        test_chat("What crops should I plant?", session)
    
    # Test 3: Ask about market prices
    test_chat("What are the current market prices for wheat?")
    
    # Test 4: Hindi query
    test_chat("मुझे गेहूं की सलाह दो")
    
    print("\n" + "="*60)
    print("✓ Chatbot tests completed!")
    print("="*60)

if __name__ == "__main__":
    main()
