"""
Piritiya FastAPI Backend
Simple agricultural advisory API without Bedrock
"""
import logging
import os
import json
import time
import tempfile
import uuid
from urllib.parse import urlparse
from urllib.request import urlopen

logger = logging.getLogger(__name__)

import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
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

# CORS: use CORS_ORIGINS env in production (e.g. https://your-app.netlify.app), else allow all for dev
_cors_origins = os.getenv("CORS_ORIGINS", "*")
_origins = _cors_origins.split(",") if _cors_origins != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS clients
_region = os.getenv('AWS_REGION', 'us-east-1')
lambda_client = boto3.client('lambda', region_name=_region)
dynamodb = boto3.resource('dynamodb', region_name=_region)
transcribe_client = boto3.client('transcribe', region_name=_region)
polly_client = boto3.client('polly', region_name=_region)
s3_client = boto3.client('s3', region_name=_region)

# Request models
class SoilMoistureRequest(BaseModel):
    farmer_id: str

class CropAdviceRequest(BaseModel):
    farmer_id: str
    soil_moisture: Optional[float] = None

class MarketPriceRequest(BaseModel):
    crop: Optional[str] = None
    district: Optional[str] = None


class SynthesizeRequest(BaseModel):
    text: str
    language: str  # "hi" | "en"


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
            "market_prices": "/market-prices",
            "speech_transcribe": "/speech/transcribe",
            "speech_synthesize": "/speech/synthesize"
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


# --- Speech: Transcribe & Polly ---

def _get_media_format(filename: str, content_type: Optional[str]) -> str:
    """Map upload filename/content_type to Transcribe MediaFormat."""
    ext = (filename or "").split(".")[-1].lower()
    if ext in ("webm", "ogg", "opus"):
        return "webm"
    if ext in ("mp3", "mpeg"):
        return "mp3"
    if ext in ("wav", "wave"):
        return "wav"
    if ext in ("flac",):
        return "flac"
    if content_type and "webm" in content_type:
        return "webm"
    if content_type and "mpeg" in content_type or content_type and "mp3" in content_type:
        return "mp3"
    return "webm"  # default for browser MediaRecorder


def _parse_s3_https_url(url: str) -> tuple[str, str] | None:
    """Parse S3 HTTPS URL into (bucket, key). Returns None if not an S3 URL."""
    if "amazonaws.com" not in url or not url.startswith("https://"):
        return None
    try:
        parsed = urlparse(url)
        path = (parsed.path or "").lstrip("/")
        host = parsed.netloc.lower()
        # https://bucket.s3.region.amazonaws.com/key
        if ".s3." in host and host.endswith(".amazonaws.com"):
            bucket = host.split(".s3.")[0]
            key = path
        # https://s3.region.amazonaws.com/bucket/key
        elif host.startswith("s3.") and host.endswith(".amazonaws.com"):
            parts = path.split("/", 1)
            if len(parts) < 2:
                return None
            bucket, key = parts[0], parts[1]
        else:
            return None
        if bucket and key:
            return (bucket, key)
    except Exception:
        pass
    return None


def _fetch_transcript_json(transcript_uri: str, bucket: str) -> dict:
    """Fetch transcript JSON from TranscriptFileUri (s3://, S3 HTTPS, or presigned HTTPS)."""
    if transcript_uri.startswith("s3://"):
        parts = transcript_uri.replace("s3://", "").split("/", 1)
        if len(parts) != 2:
            raise ValueError(f"Invalid S3 URI: {transcript_uri}")
        s3_bucket, s3_key = parts[0], parts[1]
        resp = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
        return json.loads(resp["Body"].read().decode("utf-8"))
    # S3 HTTPS URL (e.g. from Transcribe) — requires auth, so use boto3
    s3_parsed = _parse_s3_https_url(transcript_uri)
    if s3_parsed:
        s3_bucket, s3_key = s3_parsed
        resp = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
        return json.loads(resp["Body"].read().decode("utf-8"))
    # Presigned or other HTTPS
    with urlopen(transcript_uri) as f:
        return json.loads(f.read().decode("utf-8"))


@app.post("/speech/transcribe")
async def speech_transcribe(
    file: UploadFile = File(...),
    language_code: str = Form("hi-IN"),
):
    """
    Transcribe audio to text using Amazon Transcribe (batch).
    Requires AWS_TRANSCRIBE_BUCKET to be set; audio is uploaded to S3 for the job.
    """
    bucket = os.getenv("AWS_TRANSCRIBE_BUCKET")
    if not bucket:
        raise HTTPException(
            status_code=503,
            detail="Transcribe not configured. Set AWS_TRANSCRIBE_BUCKET.",
        )
    # Supported: hi-IN, en-IN. AWS batch Transcribe supports more (e.g. bn-IN, ta-IN); extend as needed.
    if language_code not in ("hi-IN", "en-IN"):
        raise HTTPException(status_code=400, detail="language_code must be hi-IN or en-IN")

    key = f"transcribe-input/{uuid.uuid4().hex}.webm"
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:  # 10 MB
            raise HTTPException(status_code=400, detail="Audio file too large (max 10 MB)")
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            s3_client.put_object(Bucket=bucket, Key=key, Body=contents, ContentType=file.content_type or "audio/webm")
            media_uri = f"s3://{bucket}/{key}"
            job_name = f"piritiya-{uuid.uuid4().hex}"[:200]

            transcribe_client.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={"MediaFileUri": media_uri},
                MediaFormat=_get_media_format(file.filename or "", file.content_type),
                LanguageCode=language_code,
                OutputBucketName=bucket,
                OutputKey=f"transcribe-output/{job_name}.json",
            )
            # Poll until complete (max ~2 min)
            for _ in range(60):
                job = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
                status = job["TranscriptionJob"]["TranscriptionJobStatus"]
                if status == "COMPLETED":
                    transcript_uri = job["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
                    data = _fetch_transcript_json(transcript_uri, bucket)
                    transcript = ""
                    for item in data.get("results", {}).get("transcripts", []):
                        transcript += item.get("transcript", "")
                    return {"transcript": transcript.strip()}
                if status == "FAILED":
                    fail_reason = job["TranscriptionJob"].get("FailureReason", "Unknown")
                    raise HTTPException(status_code=500, detail=f"Transcription failed: {fail_reason}")
                time.sleep(2)
            raise HTTPException(status_code=504, detail="Transcription timed out")
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            try:
                s3_client.delete_object(Bucket=bucket, Key=key)
            except Exception:
                pass
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Transcribe error")
        err_msg = str(e)
        if "timed out" in err_msg.lower() or "timeout" in err_msg.lower():
            raise HTTPException(status_code=504, detail="Transcription timed out. Please try again.")
        if "s3" in err_msg.lower() or "bucket" in err_msg.lower():
            raise HTTPException(status_code=503, detail="Storage error. Check AWS_TRANSCRIBE_BUCKET and permissions.")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {err_msg}")


@app.post("/speech/synthesize")
async def speech_synthesize(request: SynthesizeRequest):
    """
    Text-to-speech using Amazon Polly. Returns audio/mpeg.
    """
    if request.language not in ("hi", "en"):
        raise HTTPException(status_code=400, detail="language must be hi or en")
    voice_id = "Kajal" if request.language == "hi" else "Aditi"
    try:
        resp = polly_client.synthesize_speech(
            Text=request.text,
            OutputFormat="mp3",
            VoiceId=voice_id,
            Engine="neural",
        )
        audio_bytes = resp["AudioStream"].read()
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Polly synthesis failed: {str(e)}")


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
