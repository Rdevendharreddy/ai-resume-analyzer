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

![Python](https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FASTAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Gemini](https://img.shields.io/badge/GEMINI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![PyPDF](https://img.shields.io/badge/PYPDF-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Uvicorn](https://img.shields.io/badge/UVICORN-499848?style=for-the-badge&logo=gunicorn&logoColor=white)

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
