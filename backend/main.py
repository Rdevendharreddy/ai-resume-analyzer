import os
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

ENV_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    ".env"
)

load_dotenv(dotenv_path=ENV_PATH)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI(title="AI Resume Analyzer")


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Request model
# ---------------------------------------------------------

class ResumeRequest(BaseModel):
    resume: str
    job_description: str
    role: str
    experience_level: str


# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------
# Gemini analysis
# ---------------------------------------------------------

def analyze_with_gemini(
    resume: str,
    job_description: str,
    role: str,
    experience_level: str
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured on the server."
        )

    prompt = f"""
You are a professional ATS resume analyzer.

Analyze the resume against the job description.

Target role:
{role}

Experience level:
{experience_level}

RESUME:
{resume}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON.

Use exactly this structure:

{{
  "score": 0,
  "keyword_match": 0,
  "experience_fit": 0,
  "matched_skills": [],
  "missing_skills": [],
  "tips": []
}}

Rules:

1. score must be an integer from 0 to 100.
2. keyword_match must be an integer from 0 to 100.
3. experience_fit must be an integer from 0 to 100.
4. matched_skills must contain skills found in both the resume and job description.
5. missing_skills must contain important job-description skills that are missing from the resume.
6. tips must contain practical resume improvement suggestions.
7. Do not invent experience or qualifications.
8. Evaluate only the supplied resume and job description.
"""

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        raw = response.text.strip()

        # Remove markdown fences if Gemini returns them
        if raw.startswith("```"):
            lines = raw.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            raw = "\n".join(lines).strip()

        result = json.loads(raw)

        required = {
            "score",
            "keyword_match",
            "experience_fit",
            "matched_skills",
            "missing_skills",
            "tips"
        }

        missing = required - result.keys()

        if missing:
            raise ValueError(
                f"Gemini response is missing: {missing}"
            )

        return result

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned invalid JSON. Please try again."
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {exc}"
        )


# ---------------------------------------------------------
# Analyze endpoint
# ---------------------------------------------------------

@app.post("/analyze-resume")
def analyze_resume(request: ResumeRequest):

    if not request.resume.strip():
        raise HTTPException(
            status_code=400,
            detail="Please paste your resume."
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter the job description."
        )

    result = analyze_with_gemini(
        request.resume,
        request.job_description,
        request.role,
        request.experience_level
    )

    # Calculate word count locally
    word_count = len(request.resume.split())

    result["word_count"] = word_count
    result["missing_count"] = len(result.get("missing_skills", []))

    return result