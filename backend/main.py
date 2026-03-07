"""
Piritiya FastAPI Backend
Simple agricultural advisory API without Bedrock
"""
import os
import json
import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Piritiya API",
    description="Agricultural advisory system for Uttar Pradesh farmers",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS clients
lambda_client = boto3.client('lambda', region_name=os.getenv('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))

# Request models
class SoilMoistureRequest(BaseModel):
    farmer_id: str

class CropAdviceRequest(BaseModel):
    farmer_id: str
    soil_moisture: Optional[float] = None

class MarketPriceRequest(BaseModel):
    crop: Optional[str] = None
    district: Optional[str] = None

# Helper function to invoke Lambda
def invoke_lambda(function_name: str, payload: dict):
    try:
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        result = json.loads(response['Payload'].read())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {
        "message": "Piritiya API - Agricultural Advisory System",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "farmers": "/farmers",
            "soil_moisture": "/soil-moisture/{farmer_id}",
            "crop_advice": "/crop-advice",
            "market_prices": "/market-prices"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "piritiya-api"}

@app.get("/farmers")
def list_farmers():
    """Get list of all farmers"""
    try:
        table = dynamodb.Table('Farmers')
        response = table.scan()
        return {"farmers": response.get('Items', [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/farmers/{farmer_id}")
def get_farmer(farmer_id: str):
    """Get farmer details"""
    try:
        table = dynamodb.Table('Farmers')
        response = table.get_item(Key={'farmer_id': farmer_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Farmer not found")
        return response['Item']
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/soil-moisture/{farmer_id}")
def get_soil_moisture(farmer_id: str):
    """Get soil moisture data for a farmer"""
    result = invoke_lambda('get-soil-moisture', {'farmer_id': farmer_id})
    return result

@app.post("/crop-advice")
def get_crop_advice(request: CropAdviceRequest):
    """Get crop recommendations"""
    payload = {'farmer_id': request.farmer_id}
    if request.soil_moisture:
        payload['soil_moisture'] = request.soil_moisture
    
    result = invoke_lambda('get-crop-advice', payload)
    return result

@app.get("/market-prices")
def get_market_prices(crop: Optional[str] = None, district: Optional[str] = None):
    """Get market prices"""
    payload = {}
    if crop:
        payload['crop'] = crop
    if district:
        payload['district'] = district
    
    result = invoke_lambda('get-market-prices', payload)
    return result

@app.get("/advice/{farmer_id}")
def get_complete_advice(farmer_id: str):
    """Get complete advice: soil moisture + crop recommendations + market prices"""
    try:
        # Get soil moisture
        soil_data = invoke_lambda('get-soil-moisture', {'farmer_id': farmer_id})
        
        # Get crop advice
        crop_advice = invoke_lambda('get-crop-advice', {
            'farmer_id': farmer_id,
            'soil_moisture': soil_data.get('soil_moisture')
        })
        
        # Get market prices
        market_prices = invoke_lambda('get-market-prices', {})
        
        return {
            "farmer_id": farmer_id,
            "soil_moisture": soil_data,
            "crop_advice": crop_advice,
            "market_prices": market_prices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_agent(message: str, session_id: Optional[str] = None):
    """
    Chatbot endpoint using Bedrock Agent
    This is the main endpoint for the conversational interface
    """
    from datetime import datetime
    
    if not session_id:
        session_id = f"session-{int(datetime.now().timestamp())}"
    
    agent_id = os.getenv('BEDROCK_AGENT_ID')
    alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')
    
    if not agent_id or not alias_id:
        raise HTTPException(
            status_code=500,
            detail="Bedrock agent not configured. Set BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID in .env"
        )
    
    try:
        bedrock_agent = boto3.client('bedrock-agent-runtime', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        
        response = bedrock_agent.invoke_agent(
            agentId=agent_id,
            agentAliasId=alias_id,
            sessionId=session_id,
            inputText=message
        )
        
        # Process streaming response
        result = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    result += chunk['bytes'].decode('utf-8')
        
        return {
            "response": result,
            "session_id": session_id,
            "message": message
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent invocation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
