# AI Resume Analyzer https://ai-resume-analyzer-frontend-1llv.onrender.com/

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

## Architecture

```
Browser (frontend/)        FastAPI (backend/)
  │                            │
  │  POST /analyze-resume      │
  ├───────────────────────────►│
  │    (PDF file)              │
  │                            ├──► PyPDF: extract text
  │                            ├──► Gemini API: analyze
  │    JSON response           │
  │◄───────────────────────────┤
  │                            │
  └─── Render results ─────────┘
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-resume-analyzer
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

Get a free API key at: https://aistudio.google.com/app/apikey

## Running the Application

### Start the backend

```bash
cd backend
.\venv\Scripts\activate   # or source venv/bin/activate
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Verify with: `http://localhost:8000/api/health`

### Open the frontend

Open `frontend/index.html` directly in your browser, or serve it:

```bash
cd frontend
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Example Workflow

1. Open the frontend in your browser
2. Click **Choose a PDF file** and select a resume PDF
3. Click **Analyze Resume**
4. Wait a few seconds for Gemini to analyze
5. View your score, summary, skills, strengths, and suggestions

## API Endpoints

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/health`      | Health check             |
| POST   | `/analyze-resume`  | Upload & analyze resume  |

## Future Improvements

- Support for DOCX and TXT file uploads
- Comparison of multiple resumes
- Job description matching score
- Export analysis as PDF report
- Dark/light theme toggle
