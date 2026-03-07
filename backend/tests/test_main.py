"""
Pytest tests for FastAPI backend (main.py).
Uses TestClient; mocks boto3 for speech and AWS-dependent endpoints.
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure backend root is on path so "main" can be imported when running pytest
_backend_root = Path(__file__).resolve().parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root():
    """GET / returns API metadata."""
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "endpoints" in data
    assert "health" in data["endpoints"]


def test_health():
    """GET /health returns healthy status."""
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"
    assert "service" in data


def test_speech_synthesize_success():
    """POST /speech/synthesize returns audio/mpeg when Polly is mocked."""
    fake_audio = b"\xff\xfb\x90\x00\x00\x00\x00"  # minimal fake mp3 bytes
    mock_stream = MagicMock()
    mock_stream.read.return_value = fake_audio

    with patch("main.polly_client") as mock_polly:
        mock_polly.synthesize_speech.return_value = {"AudioStream": mock_stream}
        r = client.post(
            "/speech/synthesize",
            json={"text": "hello farmer", "language": "en"},
        )
    assert r.status_code == 200
    assert r.headers.get("content-type") == "audio/mpeg"
    assert r.content == fake_audio


def test_speech_synthesize_invalid_language():
    """POST /speech/synthesize with invalid language returns 400."""
    r = client.post(
        "/speech/synthesize",
        json={"text": "hello", "language": "xx"},
    )
    assert r.status_code == 400
    assert "language" in (r.json().get("detail") or "").lower()


def test_speech_synthesize_polly_error_returns_500():
    """POST /speech/synthesize when Polly raises returns 500."""
    with patch("main.polly_client") as mock_polly:
        mock_polly.synthesize_speech.side_effect = Exception("Polly error")
        r = client.post(
            "/speech/synthesize",
            json={"text": "hello", "language": "en"},
        )
    assert r.status_code == 500
    assert "detail" in r.json()


def test_speech_transcribe_no_bucket_returns_503():
    """POST /speech/transcribe when AWS_TRANSCRIBE_BUCKET is not set returns 503."""
    def mock_getenv(k, d=None):
        if k == "AWS_TRANSCRIBE_BUCKET":
            return None
        return os.getenv(k, d)

    with patch("main.os.getenv", side_effect=mock_getenv):
        r = client.post(
            "/speech/transcribe",
            files={"file": ("audio.webm", b"fake-audio", "audio/webm")},
            data={"language_code": "hi-IN"},
        )
    assert r.status_code == 503
    assert "detail" in r.json()


def test_speech_transcribe_invalid_language_returns_400():
    """POST /speech/transcribe with invalid language_code returns 400."""
    def mock_getenv(k, d=None):
        if k == "AWS_TRANSCRIBE_BUCKET":
            return "piritiya-transcribe"
        return os.getenv(k, d)

    with patch("main.os.getenv", side_effect=mock_getenv):
        r = client.post(
            "/speech/transcribe",
            files={"file": ("a.webm", b"x", "audio/webm")},
            data={"language_code": "xx-XX"},
        )
    assert r.status_code == 400
