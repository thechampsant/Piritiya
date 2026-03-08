"""
AWS Lambda entry point for Piritiya FastAPI backend.
Use with API Gateway HTTP API (payload format 2.0).
Set handler to lambda_handler.handler.
"""
from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")
