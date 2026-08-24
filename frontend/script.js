// =====================================================
// AI RESUME ANALYZER - FRONTEND
// =====================================================

const API_URL = "http://127.0.0.1:8000";

// =====================================================
// DOM ELEMENTS
// =====================================================

const roleSelect = document.getElementById("roleSelect");
const levelSelect = document.getElementById("levelSelect");

const resumeInput = document.getElementById("resumeInput");
const resumeFile = document.getElementById("resumeFile");

const jobInput = document.getElementById("jobInput");

const pdfMethodBtn = document.getElementById("pdfMethodBtn");
const textMethodBtn = document.getElementById("textMethodBtn");

const pdfSection = document.getElementById("pdfSection");
const textSection = document.getElementById("textSection");

const fileInfo = document.getElementById("fileInfo");

const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const loadingBox = document.getElementById("loadingBox");

const overallScore = document.getElementById("overallScore");
const keywordMatch = document.getElementById("keywordMatch");
const missingCount = document.getElementById("missingCount");
const experienceFit = document.getElementById("experienceFit");
const wordCount = document.getElementById("wordCount");

const matchedSkills = document.getElementById("matchedSkills");
const missingSkills = document.getElementById("missingSkills");

const tipsList = document.getElementById("tipsList");

const resultStatus = document.getElementById("resultStatus");

const ringProgress = document.getElementById("ringProgress");


// =====================================================
// PDF / TEXT METHOD
// =====================================================

pdfMethodBtn.addEventListener("click", () => {

    pdfMethodBtn.classList.add("active");
    textMethodBtn.classList.remove("active");

    pdfSection.classList.remove("hidden");
    textSection.classList.add("hidden");

});


textMethodBtn.addEventListener("click", () => {

    textMethodBtn.classList.add("active");
    pdfMethodBtn.classList.remove("active");

    textSection.classList.remove("hidden");
    pdfSection.classList.add("hidden");

});


// =====================================================
// PDF FILE SELECTION
// =====================================================

resumeFile.addEventListener("change", () => {

    const file = resumeFile.files[0];

    if (!file) {

        fileInfo.textContent = "";
        fileInfo.classList.add("hidden");

        return;
    }

    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {

        alert("Please select a PDF file.");

        resumeFile.value = "";

        fileInfo.textContent = "";
        fileInfo.classList.add("hidden");

        return;
    }

    fileInfo.textContent =
        `Selected: ${file.name}`;

    fileInfo.classList.remove("hidden");

});


// =====================================================
// ANALYZE BUTTON
// =====================================================

analyzeBtn.addEventListener("click", async () => {

    const jobDescription =
        jobInput.value.trim();

    if (!jobDescription) {

        alert("Please enter the job description.");

        jobInput.focus();

        return;
    }


    const usingPDF =
        !pdfSection.classList.contains("hidden");


    // -------------------------------------------------
    // Validate resume
    // -------------------------------------------------

    if (usingPDF) {

        if (!resumeFile.files[0]) {

            alert("Please upload your Resume PDF.");

            return;
        }

    } else {

        if (!resumeInput.value.trim()) {

            alert("Please paste your resume.");

            resumeInput.focus();

            return;
        }

    }


    // -------------------------------------------------
    // Loading state
    // -------------------------------------------------

    analyzeBtn.disabled = true;

    analyzeBtn.textContent =
        "Analyzing...";

    loadingBox.classList.remove("hidden");

    resultStatus.textContent =
        "Analyzing your resume against the job description...";


    try {

        const formData = new FormData();


        // -------------------------------------------------
        // Resume
        // -------------------------------------------------

        if (usingPDF) {

            formData.append(
                "resume_file",
                resumeFile.files[0]
            );

        } else {

            // IMPORTANT:
            // Backend expects "resume_text"

            formData.append(
                "resume_text",
                resumeInput.value.trim()
            );

        }


        // -------------------------------------------------
        // Job information
        // -------------------------------------------------

        formData.append(
            "job_description",
            jobDescription
        );

        formData.append(
            "role",
            roleSelect.value
        );

        formData.append(
            "experience_level",
            levelSelect.value
        );


        // -------------------------------------------------
        // API request
        // -------------------------------------------------

        const response = await fetch(
            `${API_URL}/analyze-resume`,
            {
                method: "POST",
                body: formData
            }
        );


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        let data;

        try {

            data = await response.json();

        } catch {

            throw new Error(
                "The backend returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Resume analysis failed."
            );

        }


        // -------------------------------------------------
        // Display results
        // -------------------------------------------------

        displayResults(data);


    } catch (error) {

        console.error(
            "Resume analysis error:",
            error
        );

        resultStatus.textContent =
            "Analysis failed.";

        alert(
            "Could not analyze the resume.\n\n" +
            error.message
        );


    } finally {

        analyzeBtn.disabled = false;

        analyzeBtn.textContent =
            "Analyze Resume";

        loadingBox.classList.add("hidden");

    }

});


// =====================================================
// DISPLAY RESULTS
// =====================================================

function displayResults(data) {

    const score =
        Number(data.score) || 0;

    const keyword =
        Number(data.keyword_match) || 0;

    const experience =
        Number(data.experience_fit) || 0;

    const missing =
        Number(data.missing_count) || 0;

    const words =
        Number(data.word_count) || 0;


    // -------------------------------------------------
    // Main numbers
    // -------------------------------------------------

    overallScore.textContent =
        `${score}%`;

    keywordMatch.textContent =
        `${keyword}%`;

    missingCount.textContent =
        missing;

    experienceFit.textContent =
        `${experience}%`;

    wordCount.textContent =
        words;


    // =================================================
    // MATCHED SKILLS
    // =================================================

    matchedSkills.innerHTML = "";

    const matched =
        Array.isArray(data.matched_skills)
            ? data.matched_skills
            : [];


    if (matched.length === 0) {

        const span =
            document.createElement("span");

        span.className =
            "chip neutral";

        span.textContent =
            "No matched skills";

        matchedSkills.appendChild(span);

    } else {

        matched.forEach(skill => {

            const span =
                document.createElement("span");

            span.className =
                "chip good";

            span.textContent =
                skill;

            matchedSkills.appendChild(span);

        });

    }


    // =================================================
    // MISSING SKILLS
    // =================================================

    missingSkills.innerHTML = "";

    const missingItems =
        Array.isArray(data.missing_skills)
            ? data.missing_skills
            : [];


    if (missingItems.length === 0) {

        const span =
            document.createElement("span");

        span.className =
            "chip neutral";

        span.textContent =
            "No major missing skills";

        missingSkills.appendChild(span);

    } else {

        missingItems.forEach(skill => {

            const span =
                document.createElement("span");

            span.className =
                "chip warning";

            span.textContent =
                skill;

            missingSkills.appendChild(span);

        });

    }


    // =================================================
    // TIPS
    // =================================================

    tipsList.innerHTML = "";

    const tips =
        Array.isArray(data.tips)
            ? data.tips
            : [];


    if (tips.length === 0) {

        const li =
            document.createElement("li");

        li.textContent =
            "No additional suggestions.";

        tipsList.appendChild(li);

    } else {

        tips.forEach(tip => {

            const li =
                document.createElement("li");

            li.textContent =
                tip;

            tipsList.appendChild(li);

        });

    }


    // =================================================
    // SCORE RING
    // =================================================

    updateScoreRing(score);


    resultStatus.textContent =
        "Analysis completed successfully.";

}


// =====================================================
// SCORE RING
// =====================================================

function updateScoreRing(score) {

    const radius = 46;

    const circumference =
        2 * Math.PI * radius;


    ringProgress.style.strokeDasharray =
        circumference;

    ringProgress.style.strokeDashoffset =
        circumference -
        (score / 100) * circumference;

}


// =====================================================
// RESET
// =====================================================

resetBtn.addEventListener("click", () => {

    resumeInput.value = "";

    jobInput.value = "";

    resumeFile.value = "";

    fileInfo.textContent = "";

    fileInfo.classList.add("hidden");


    overallScore.textContent =
        "0%";

    keywordMatch.textContent =
        "0%";

    missingCount.textContent =
        "0";

    experienceFit.textContent =
        "0%";

    wordCount.textContent =
        "0";


    matchedSkills.innerHTML =
        `<span class="chip neutral">
            No data yet
        </span>`;


    missingSkills.innerHTML =
        `<span class="chip warning">
            No data yet
        </span>`;


    tipsList.innerHTML =
        `<li>
            Upload your resume and enter a job description to begin.
        </li>`;


    resultStatus.textContent =
        "Ready to analyze your resume.";


    updateScoreRing(0);


    pdfMethodBtn.classList.add("active");

    textMethodBtn.classList.remove("active");

    pdfSection.classList.remove("hidden");

    textSection.classList.add("hidden");

});


// =====================================================
// INITIAL STATE
// =====================================================

updateScoreRing(0);