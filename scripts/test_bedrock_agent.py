#!/usr/bin/env python3
"""
Test script for Piritiya Bedrock Agent
Usage: 
  python3 scripts/test_bedrock_agent.py <AGENT_ID> <AGENT_ALIAS_ID>
  OR (using .env file):
  python3 scripts/test_bedrock_agent.py
"""

import sys
import os
import boto3
import json
from datetime import datetime
from pathlib import Path

# Try to load .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, will use command line args

def invoke_agent(agent_id, agent_alias_id, user_input, session_id):
    """Invoke Bedrock agent with user input"""
    region = os.getenv('AWS_REGION', 'ap-south-1')
    client = boto3.client('bedrock-agent-runtime', region_name=region)
    
    try:
        response = client.invoke_agent(
            agentId=agent_id,
            agentAliasId=agent_alias_id,
            sessionId=session_id,
            inputText=user_input
        )
        
        # Process streaming response
        result = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    result += chunk['bytes'].decode('utf-8')
        
        return result
    
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    # Try to get from command line args first, then from .env
    if len(sys.argv) >= 3:
        agent_id = sys.argv[1]
        agent_alias_id = sys.argv[2]
    else:
        agent_id = os.getenv('BEDROCK_AGENT_ID')
        agent_alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')
        
        if not agent_id or not agent_alias_id:
            print("Usage: python3 scripts/test_bedrock_agent.py <AGENT_ID> <AGENT_ALIAS_ID>")
            print("\nOR configure in .env file:")
            print("  BEDROCK_AGENT_ID=your-agent-id")
            print("  BEDROCK_AGENT_ALIAS_ID=your-alias-id")
            print("\nGet these values from AWS Console:")
            print("  → Amazon Bedrock → Agents → Your Agent")
            print("  → Agent ID: Found in agent details")
            print("  → Alias ID: Found in Aliases tab (use TSTALIASID for testing)")
            print("\nSee BEDROCK_CONFIG.md for detailed instructions")
            sys.exit(1)
    
    session_id = f"test-session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    print("=" * 60)
    print("Piritiya Bedrock Agent Test")
    print("=" * 60)
    print(f"Agent ID: {agent_id}")
    print(f"Alias ID: {agent_alias_id}")
    print(f"Session ID: {session_id}")
    print(f"Region: {os.getenv('AWS_REGION', 'ap-south-1')}")
    print("=" * 60)
    print()
    
    # Test queries
    test_queries = [
        "What is the soil moisture for farmer F001?",
        "Give me crop recommendations for farmer F001",
        "What are the current market prices for wheat?",
        "मुझे गेहूं की सलाह दो",  # Give me advice for wheat in Hindi
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'=' * 60}")
        print(f"Test {i}: {query}")
        print('=' * 60)
        
        response = invoke_agent(agent_id, agent_alias_id, query, session_id)
        print(f"\nResponse:\n{response}")
        print()
    
    print("=" * 60)
    print("✓ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
