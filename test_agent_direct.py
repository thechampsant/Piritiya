#!/usr/bin/env python3
"""
Direct test of Bedrock Agent
"""
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

agent_id = os.getenv('BEDROCK_AGENT_ID')
alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')
region = os.getenv('AWS_REGION', 'us-east-1')

print(f"Testing Bedrock Agent:")
print(f"  Agent ID: {agent_id}")
print(f"  Alias ID: {alias_id}")
print(f"  Region: {region}")
print()

try:
    client = boto3.client('bedrock-agent-runtime', region_name=region)
    
    response = client.invoke_agent(
        agentId=agent_id,
        agentAliasId=alias_id,
        sessionId='test-session-123',
        inputText='Hello, can you help me?'
    )
    
    print("✓ Agent invocation successful!")
    print("\nResponse:")
    
    result = ""
    for event in response['completion']:
        if 'chunk' in event:
            chunk = event['chunk']
            if 'bytes' in chunk:
                result += chunk['bytes'].decode('utf-8')
    
    print(result)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
