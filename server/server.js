const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const Database = require("better-sqlite3");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

// ===============================
// DATABASE
// ===============================

const db = new Database("resume_ai.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_name TEXT NOT NULL,
        job_description TEXT NOT NULL,
        match_score INTEGER NOT NULL,
        required_skills TEXT NOT NULL,
        found_skills TEXT NOT NULL,
        missing_skills TEXT NOT NULL,
        suggestions TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("Database connected successfully.");

// ===============================
// SKILL GROUPS
// ===============================

const skillGroups = [
    {
        name: "JavaScript",
        keywords: ["javascript", "js"]
    },
    {
        name: "React",
        keywords: ["react", "react.js", "reactjs"]
    },
    {
        name: "Node.js",
        keywords: ["node.js", "nodejs", "node"]
    },
    {
        name: "Express.js",
        keywords: ["express", "express.js"]
    },
    {
        name: "HTML",
        keywords: ["html", "html5"]
    },
    {
        name: "CSS",
        keywords: ["css", "css3"]
    },
    {
        name: "SQL",
        keywords: ["sql"]
    },
    {
        name: "MySQL",
        keywords: ["mysql"]
    },
    {
        name: "PostgreSQL",
        keywords: ["postgresql", "postgres"]
    },
    {
        name: "MongoDB",
        keywords: ["mongodb", "mongo"]
    },
    {
        name: "Git",
        keywords: ["git"]
    },
    {
        name: "GitHub",
        keywords: ["github"]
    },
    {
        name: "REST API",
        keywords: ["rest api", "restful api", "restful"]
    },
    {
        name: "TypeScript",
        keywords: ["typescript", "ts"]
    },
    {
        name: "Java",
        keywords: ["java"]
    },
    {
        name: "Python",
        keywords: ["python"]
    },
    {
        name: "Docker",
        keywords: ["docker"]
    },
    {
        name: "AWS",
        keywords: ["aws", "amazon web services"]
    },
    {
        name: "DSA",
        keywords: [
            "data structures",
            "data structure",
            "algorithms",
            "dsa"
        ]
    },
    {
        name: "React Native",
        keywords: ["react native"]
    }
];

// ===============================
// HELPER FUNCTIONS
// ===============================

function containsSkill(text, keywords) {
    return keywords.some((keyword) => {
        return text.includes(keyword);
    });
}

function analyzeSkills(resumeText, jobDescription) {
    const resume = resumeText.toLowerCase();
    const job = jobDescription.toLowerCase();

    const requiredSkills = skillGroups
        .filter((skill) => {
            return containsSkill(job, skill.keywords);
        })
        .map((skill) => skill.name);

    const foundSkills = skillGroups
        .filter((skill) => {
            return (
                containsSkill(job, skill.keywords) &&
                containsSkill(resume, skill.keywords)
            );
        })
        .map((skill) => skill.name);

    const missingSkills = skillGroups
        .filter((skill) => {
            return (
                containsSkill(job, skill.keywords) &&
                !containsSkill(resume, skill.keywords)
            );
        })
        .map((skill) => skill.name);

    let matchScore = 0;

    if (requiredSkills.length > 0) {
        matchScore = Math.round(
            (foundSkills.length / requiredSkills.length) * 100
        );
    }

    const suggestions = [];

    if (missingSkills.length > 0) {
        suggestions.push(
            `Consider learning or adding relevant experience with: ${missingSkills.join(", ")}.`
        );
    }

    if (!resume.includes("project") && !resume.includes("projects")) {
        suggestions.push(
            "Add at least one technical project with technologies and your contribution."
        );
    }

    if (!resume.includes("github")) {
        suggestions.push(
            "Add your GitHub profile or relevant project repositories."
        );
    }

    if (!resume.includes("api") && !resume.includes("rest")) {
        suggestions.push(
            "Mention REST API experience if you have built or used APIs."
        );
    }

    if (
        !resume.includes("internship") &&
        !resume.includes("experience")
    ) {
        suggestions.push(
            "Highlight internships, practical experience, coursework, or significant projects."
        );
    }

    if (suggestions.length === 0) {
        suggestions.push(
            "Your resume covers the detected technical requirements well."
        );
    }

    let scoreMessage = "";

    if (matchScore >= 80) {
        scoreMessage = "Strong skill alignment with the job description.";
    } else if (matchScore >= 60) {
        scoreMessage =
            "Good alignment, but some required skills may need attention.";
    } else if (matchScore >= 40) {
        scoreMessage =
            "Moderate alignment. Consider improving the missing skill areas.";
    } else {
        scoreMessage =
            "Several job-related skills were not detected in the resume.";
    }

    return {
        matchScore,
        scoreMessage,
        requiredSkills,
        foundSkills,
        missingSkills,
        suggestions
    };
}

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("ResumeAI Backend is working!");
});

// ===============================
// ANALYZE RESUME
// ===============================

app.post("/analyze", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume PDF."
            });
        }

        const jobDescription = req.body.jobDescription;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Please provide a job description."
            });
        }

        // Extract PDF text
        const parser = new PDFParse({
            data: req.file.buffer
        });

        const result = await parser.getText();
        const resumeText = result.text;

        await parser.destroy();

        console.log("Resume received:", req.file.originalname);

        // Analyze resume
        const analysis = analyzeSkills(
            resumeText,
            jobDescription
        );

        // Save analysis to database
        const insertAnalysis = db.prepare(`
            INSERT INTO analyses (
                resume_name,
                job_description,
                match_score,
                required_skills,
                found_skills,
                missing_skills,
                suggestions
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const databaseResult = insertAnalysis.run(
            req.file.originalname,
            jobDescription,
            analysis.matchScore,
            JSON.stringify(analysis.requiredSkills),
            JSON.stringify(analysis.foundSkills),
            JSON.stringify(analysis.missingSkills),
            JSON.stringify(analysis.suggestions)
        );

        console.log(
            "Analysis saved with ID:",
            databaseResult.lastInsertRowid
        );

        res.json({
            message: "Resume analyzed and saved successfully!",
            id: databaseResult.lastInsertRowid,
            ...analysis
        });

    } catch (error) {
        console.error("Analysis error:", error);

        res.status(500).json({
            message: "Could not analyze the resume."
        });
    }
});

// ===============================
// GET ANALYSIS HISTORY
// ===============================

app.get("/api/history", (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT *
            FROM analyses
            ORDER BY id DESC
        `).all();

        const history = rows.map((row) => ({
            id: row.id,
            resumeName: row.resume_name,
            jobDescription: row.job_description,
            matchScore: row.match_score,
            requiredSkills: JSON.parse(row.required_skills),
            foundSkills: JSON.parse(row.found_skills),
            missingSkills: JSON.parse(row.missing_skills),
            suggestions: JSON.parse(row.suggestions),
            createdAt: row.created_at
        }));

        res.json(history);

    } catch (error) {
        console.error("History error:", error);

        res.status(500).json({
            message: "Could not load analysis history."
        });
    }
});

// ===============================
// DELETE ANALYSIS
// ===============================

app.delete("/api/history/:id", (req, res) => {
    try {
        const id = req.params.id;

        const result = db
            .prepare("DELETE FROM analyses WHERE id = ?")
            .run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Analysis not found."
            });
        }

        res.json({
            message: "Analysis deleted successfully."
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            message: "Could not delete analysis."
        });
    }
});

// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Backend running at http://localhost:${PORT}`
    );
});