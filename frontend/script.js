// =====================================================
// AI Resume Analyzer - Frontend
// =====================================================

const API_URL = "http://127.0.0.1:8000";

// -----------------------------------------------------
// DOM elements
// -----------------------------------------------------

const roleSelect = document.getElementById("roleSelect");
const levelSelect = document.getElementById("levelSelect");
const resumeInput = document.getElementById("resumeInput");
const jobInput = document.getElementById("jobInput");

const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const overallScore = document.getElementById("overallScore");
const keywordMatch = document.getElementById("keywordMatch");
const missingCount = document.getElementById("missingCount");
const experienceFit = document.getElementById("experienceFit");
const wordCount = document.getElementById("wordCount");

const matchedSkills = document.getElementById("matchedSkills");
const missingSkills = document.getElementById("missingSkills");
const tipsList = document.getElementById("tipsList");


// -----------------------------------------------------
// Analyze Resume
// -----------------------------------------------------

analyzeBtn.addEventListener("click", async () => {

    const resume = resumeInput.value.trim();
    const jobDescription = jobInput.value.trim();
    const role = roleSelect.value;
    const experienceLevel = levelSelect.value;

    if (!resume) {
        alert("Please paste your resume.");
        resumeInput.focus();
        return;
    }

    if (!jobDescription) {
        alert("Please enter the job description.");
        jobInput.focus();
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {

        const response = await fetch(
            `${API_URL}/analyze-resume`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume: resume,
                    job_description: jobDescription,
                    role: role,
                    experience_level: experienceLevel
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Resume analysis failed."
            );
        }

        displayResults(data);

    } catch (error) {

        console.error("Analysis error:", error);

        alert(
            "Could not analyze the resume.\n\n" +
            error.message
        );

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Resume";
    }
});


// -----------------------------------------------------
// Display Results
// -----------------------------------------------------

function displayResults(data) {

    const score = Number(data.score) || 0;
    const keyword = Number(data.keyword_match) || 0;
    const experience = Number(data.experience_fit) || 0;
    const missing = Number(data.missing_count) || 0;
    const words = Number(data.word_count) || 0;

    overallScore.textContent = `${score}%`;
    keywordMatch.textContent = `${keyword}%`;
    missingCount.textContent = missing;
    experienceFit.textContent = `${experience}%`;
    wordCount.textContent = words;


    // ---------------------------------------------
    // Matched skills
    // ---------------------------------------------

    matchedSkills.innerHTML = "";

    const matched = data.matched_skills || [];

    if (matched.length === 0) {

        const span = document.createElement("span");
        span.className = "chip neutral";
        span.textContent = "No matched skills";
        matchedSkills.appendChild(span);

    } else {

        matched.forEach(skill => {

            const span = document.createElement("span");

            span.className = "chip";
            span.textContent = skill;

            matchedSkills.appendChild(span);
        });
    }


    // ---------------------------------------------
    // Missing skills
    // ---------------------------------------------

    missingSkills.innerHTML = "";

    const missingItems = data.missing_skills || [];

    if (missingItems.length === 0) {

        const span = document.createElement("span");

        span.className = "chip neutral";
        span.textContent = "No major missing skills";

        missingSkills.appendChild(span);

    } else {

        missingItems.forEach(skill => {

            const span = document.createElement("span");

            span.className = "chip warning";
            span.textContent = skill;

            missingSkills.appendChild(span);
        });
    }


    // ---------------------------------------------
    // Tips
    // ---------------------------------------------

    tipsList.innerHTML = "";

    const tips = data.tips || [];

    if (tips.length === 0) {

        const li = document.createElement("li");
        li.textContent = "No additional suggestions.";

        tipsList.appendChild(li);

    } else {

        tips.forEach(tip => {

            const li = document.createElement("li");

            li.textContent = tip;

            tipsList.appendChild(li);
        });
    }


    // ---------------------------------------------
    // Score ring
    // ---------------------------------------------

    const ring = document.querySelector(".ring-progress");

    if (ring) {

        const radius = 46;
        const circumference = 2 * Math.PI * radius;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset =
            circumference - (score / 100) * circumference;
    }
}


// -----------------------------------------------------
// Reset
// -----------------------------------------------------

resetBtn.addEventListener("click", () => {

    resumeInput.value = "";
    jobInput.value = "";

    overallScore.textContent = "0%";
    keywordMatch.textContent = "0%";
    missingCount.textContent = "0";
    experienceFit.textContent = "0%";
    wordCount.textContent = "0";

    matchedSkills.innerHTML =
        '<span class="chip neutral">No data yet</span>';

    missingSkills.innerHTML =
        '<span class="chip warning">No data yet</span>';

    tipsList.innerHTML =
        "<li>Paste the resume and job description to begin.</li>";

    const ring = document.querySelector(".ring-progress");

    if (ring) {
        const radius = 46;
        const circumference = 2 * Math.PI * radius;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;
    }
});


// -----------------------------------------------------
// Filter buttons
// -----------------------------------------------------

document.querySelectorAll(".filter-chip").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".filter-chip")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");
    });
});