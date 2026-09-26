# ResumeAI

ResumeAI is a full-stack web application that analyzes a resume against a job description and identifies matching skills, missing skills, and areas for improvement.

The application allows users to upload a PDF resume, provide a job description, and receive an automated resume-to-job skill match analysis.

## 🚀 Features

- Upload resume as a PDF
- Extract text from PDF resumes
- Paste a job description
- Detect technical skills from the job description
- Detect matching skills from the resume
- Identify missing skills
- Calculate a resume match score
- Generate resume improvement suggestions
- Save analysis results in a SQLite database
- View previous analysis history
- Delete analysis history
- REST API based backend
- Responsive React frontend

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST API
- Multer
- PDF parsing

### Database

- SQLite
- better-sqlite3

### Development Tools

- Git
- GitHub
- VS Code

## 🏗️ Project Architecture

```text
React Frontend
      │
      │ HTTP REST API
      ▼
Express Backend
      │
      ├── PDF Processing
      ├── Skill Analysis
      ├── Score Calculation
      │
      ▼
SQLite Database
      │
      └── Analysis History