import os
import json
import re
from io import BytesIO

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader


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
# Health Check
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "AI Resume Analyzer backend is running."
    }


# ---------------------------------------------------------
# Extract Text From PDF
# ---------------------------------------------------------

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(pdf_bytes))

        pages = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        resume_text = "\n".join(pages).strip()

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF."
            )

        return resume_text

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read PDF: {exc}"
        )


# ---------------------------------------------------------
# Clean Text
# ---------------------------------------------------------

def clean_text(text: str) -> str:
    text = text.lower()

    text = re.sub(
        r"[^a-z0-9+#.\-/ ]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ---------------------------------------------------------
# Skills Database
# ---------------------------------------------------------

SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "html",
    "css",
    "react",
    "angular",
    "vue",
    "node.js",
    "node",
    "express",
    "fastapi",
    "flask",
    "django",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "mongodb atlas",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "rest api",
    "api",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai",
    "nlp",
    "computer vision",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "power bi",
    "tableau",
    "excel",
    "data analysis",
    "data visualization",
    "langchain",
    "rag",
    "generative ai",
    "gemini",
    "openai",
    "llm",
    "communication",
    "problem solving",
    "teamwork",
    "leadership"
]


# ---------------------------------------------------------
# Extract Skills
# ---------------------------------------------------------

def extract_skills(text: str):
    normalized = clean_text(text)

    found = []

    for skill in SKILLS:

        skill_normalized = clean_text(skill)

        if skill_normalized in normalized:
            found.append(skill)

    return list(dict.fromkeys(found))


# ---------------------------------------------------------
# Calculate Keyword Match
# ---------------------------------------------------------

def calculate_keyword_match(
    resume: str,
    job_description: str
):

    resume_words = set(
        clean_text(resume).split()
    )

    job_words = set(
        clean_text(job_description).split()
    )

    if not job_words:
        return 0

    common_words = (
        resume_words.intersection(job_words)
    )

    keyword_match = round(
        (len(common_words) / len(job_words)) * 100
    )

    return max(
        0,
        min(100, keyword_match)
    )


# ---------------------------------------------------------
# Gemini Analysis
# ---------------------------------------------------------

def analyze_with_gemini(
    resume: str,
    job_description: str,
    role: str,
    experience_level: str,
    matched_skills: list,
    missing_skills: list
):

    if not GEMINI_API_KEY:

        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured on the server."
        )

    prompt = f"""
You are a professional ATS resume analyzer.

Analyze the resume ONLY against the supplied job description.

TARGET ROLE:
{role}

EXPERIENCE LEVEL:
{experience_level}

RESUME:
{resume}

JOB DESCRIPTION:
{job_description}

SKILLS DETECTED IN BOTH:
{matched_skills}

IMPORTANT SKILLS MISSING FROM RESUME:
{missing_skills}

Return ONLY valid JSON.

Use exactly this structure:

{{
  "experience_fit": 0,
  "tips": []
}}

Rules:

1. experience_fit must be an integer from 0 to 100.
2. Judge experience fit only from the supplied resume.
3. Do not invent experience.
4. Do not invent qualifications.
5. Do not invent skills.
6. tips must contain practical resume improvement suggestions.
7. Keep tips concise.
8. Return valid JSON only.
"""

    try:

        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        raw = response.text.strip()

        # Remove Markdown code fences
        if raw.startswith("```"):

            lines = raw.splitlines()

            if (
                lines
                and lines[0].strip().startswith("```")
            ):
                lines = lines[1:]

            if (
                lines
                and lines[-1].strip() == "```"
            ):
                lines = lines[:-1]

            raw = "\n".join(lines).strip()

        result = json.loads(raw)

        experience_fit = result.get(
            "experience_fit",
            0
        )

        tips = result.get(
            "tips",
            []
        )

        if not isinstance(
            experience_fit,
            int
        ):
            experience_fit = 0

        experience_fit = max(
            0,
            min(100, experience_fit)
        )

        if not isinstance(tips, list):
            tips = []

        return {
            "experience_fit": experience_fit,
            "tips": tips
        }

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=502,
            detail="Gemini returned invalid JSON."
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {exc}"
        )


# ---------------------------------------------------------
# Analyze Resume
# ---------------------------------------------------------

@app.post("/analyze-resume")
async def analyze_resume(

    resume_text: str = Form(""),

    job_description: str = Form(""),

    role: str = Form(""),

    experience_level: str = Form(""),

    resume_file: UploadFile = File(None)
):

    # -----------------------------------------------------
    # Validate Job Description
    # -----------------------------------------------------

    if not job_description.strip():

        raise HTTPException(
            status_code=400,
            detail="Please enter the job description."
        )


    # -----------------------------------------------------
    # Get Resume
    # -----------------------------------------------------

    resume = ""


    # PDF upload
    if resume_file is not None:

        if not resume_file.filename:

            raise HTTPException(
                status_code=400,
                detail="Invalid resume file."
            )

        filename = resume_file.filename.lower()

        if not filename.endswith(".pdf"):

            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF resume."
            )

        pdf_bytes = await resume_file.read()

        if not pdf_bytes:

            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        resume = extract_text_from_pdf(
            pdf_bytes
        )


    # Pasted resume
    elif resume_text.strip():

        resume = resume_text.strip()


    # Nothing provided
    else:

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume or paste your resume text."
        )


    # -----------------------------------------------------
    # Detect Skills
    # -----------------------------------------------------

    resume_skills = extract_skills(
        resume
    )

    job_skills = extract_skills(
        job_description
    )


    # -----------------------------------------------------
    # Matched Skills
    # -----------------------------------------------------

    matched_skills = [
        skill
        for skill in job_skills
        if skill in resume_skills
    ]


    # -----------------------------------------------------
    # Missing Skills
    # -----------------------------------------------------

    missing_skills = [
        skill
        for skill in job_skills
        if skill not in resume_skills
    ]


    # -----------------------------------------------------
    # Keyword Match
    # -----------------------------------------------------

    keyword_match = calculate_keyword_match(
        resume,
        job_description
    )


    # -----------------------------------------------------
    # Skill Match
    # -----------------------------------------------------

    total_skills = (
        len(matched_skills)
        + len(missing_skills)
    )

    if total_skills > 0:

        skill_match = round(
            (
                len(matched_skills)
                / total_skills
            ) * 100
        )

    else:

        skill_match = 0


    skill_match = max(
        0,
        min(100, skill_match)
    )


    # -----------------------------------------------------
    # Gemini
    # -----------------------------------------------------

    ai_result = analyze_with_gemini(

        resume=resume,

        job_description=job_description,

        role=role,

        experience_level=experience_level,

        matched_skills=matched_skills,

        missing_skills=missing_skills
    )


    experience_fit = ai_result[
        "experience_fit"
    ]


    # -----------------------------------------------------
    # FIXED FINAL SCORE
    #
    # Keyword Match  = 30%
    # Skill Match    = 50%
    # Experience Fit = 20%
    # -----------------------------------------------------

    final_score = round(

        (keyword_match * 0.30)

        + (skill_match * 0.50)

        + (experience_fit * 0.20)
    )


    final_score = max(
        0,
        min(100, final_score)
    )


    # -----------------------------------------------------
    # Word Count
    # -----------------------------------------------------

    word_count = len(
        resume.split()
    )


    # -----------------------------------------------------
    # Final Response
    # -----------------------------------------------------

    return {

        "score": final_score,

        "keyword_match": keyword_match,

        "skill_match": skill_match,

        "experience_fit": experience_fit,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "tips": ai_result["tips"],

        "word_count": word_count,

        "missing_count": len(
            missing_skills
        )
    }