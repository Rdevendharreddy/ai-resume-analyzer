# AI Resume Analyzer

Upload a PDF resume and get an instant AI-powered analysis — score, summary, skills, strengths, and improvement suggestions — powered by Google's Gemini API.

## Features

- Upload a PDF resume via a clean web interface
- Extract text from PDF using PyPDF
- Analyze the resume with Google Gemini AI
- Get a structured report with:
  - **Resume score** (0–100)
  - **Summary** of the resume
  - **Technical skills** identified
  - **Soft skills** identified
  - **Strengths**
  - **Improvement suggestions**
- Comprehensive error handling with user-friendly messages

## Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| Backend  | Python, FastAPI, Uvicorn     |
| AI       | Google Gemini 1.5 Flash      |
| PDF      | PyPDF                        |
| Frontend | HTML, CSS, JavaScript (Fetch)|

## Example Workflow

1. Open the frontend in your browser
2. Click **Choose a PDF file** and select a resume PDF
3. Click **Analyze Resume**
4. Wait a few seconds for Gemini to analyze
5. View your score, summary, skills, strengths, and suggestions

## Future Improvements

- Support for DOCX and TXT file uploads
- Comparison of multiple resumes
- Job description matching score
- Export analysis as PDF report
- Dark/light theme toggle
