import { useEffect, useState } from "react";

function App() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/history"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load history."
        );
      }

      setHistory(data);
    } catch (error) {
      console.error(error);

      alert(
        error.message || "Could not connect to the backend."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const analyzeResume = async () => {
    if (!resumeFile) {
      alert("Please upload your resume.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste the job description.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();

      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(
        "http://localhost:5000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Server error"
        );
      }

      setResult(data);

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setShowAnalyzer(false);
    setShowHistory(false);
    setResult(null);
  };

  const startNewAnalysis = () => {
    setResult(null);
    setResumeFile(null);
    setJobDescription("");
  };

  const deleteHistory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/history/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete analysis."
        );
      }

      setHistory((currentHistory) =>
        currentHistory.filter((item) => item.id !== id)
      );

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Could not connect to the backend."
      );
    }
  };

  // ==========================
  // HISTORY PAGE
  // ==========================

  if (showHistory) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5">

          <button
            onClick={goBack}
            className="text-2xl font-bold"
          >
            Resume<span className="text-blue-500">AI</span>
          </button>

          <button
            onClick={goBack}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>

        </nav>

        <main className="mx-auto max-w-5xl px-6 py-16">

          <div className="text-center">

            <h2 className="text-4xl font-bold">
              Analysis History
            </h2>

            <p className="mt-4 text-slate-400">
              Your previous resume analyses are stored here.
            </p>

          </div>

          {historyLoading ? (
            <div className="mt-12 text-center text-slate-400">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <div className="text-5xl">
                📊
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                No analyses yet
              </h3>

              <p className="mt-3 text-slate-400">
                Analyze a resume to create your first history record.
              </p>

            </div>
          ) : (
            <div className="mt-12 space-y-6">

              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <h3 className="text-xl font-bold">
                        {item.resumeName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Analysis #{item.id}
                      </p>

                    </div>

                    <div className="text-3xl font-bold text-blue-500">
                      {item.matchScore}%
                    </div>

                  </div>

                  <div className="mt-6">

                    <p className="text-sm text-slate-400">
                      Skills found
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {item.foundSkills.length > 0 ? (
                        item.foundSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          None
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="mt-5">

                    <p className="text-sm text-slate-400">
                      Missing skills
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {item.missingSkills.length > 0 ? (
                        item.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-green-400">
                          None
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

                    <span className="text-sm text-slate-500">
                      {item.createdAt}
                    </span>

                    <button
                      onClick={() => deleteHistory(item.id)}
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </main>

      </div>
    );
  }

  // ==========================
  // ANALYZER PAGE
  // ==========================

  if (showAnalyzer) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5">

          <button
            onClick={goBack}
            className="text-2xl font-bold"
          >
            Resume<span className="text-blue-500">AI</span>
          </button>

          <button
            onClick={goBack}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>

        </nav>

        <main className="mx-auto max-w-5xl px-6 py-16">

          <div className="text-center">

            <h2 className="text-4xl font-bold">
              Analyze Your Resume
            </h2>

            <p className="mt-4 text-slate-400">
              Compare your resume with a job description.
            </p>

          </div>

          {!result && (
            <div className="mt-12 space-y-8">

              <div>

                <label className="mb-3 block text-lg font-semibold">
                  Upload Resume
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900 p-12 transition hover:border-blue-500">

                  <div className="text-5xl">
                    📄
                  </div>

                  <p className="mt-4 font-medium">
                    Click to upload your resume
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    PDF files only
                  </p>

                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      setResumeFile(
                        e.target.files[0]
                      );
                    }}
                  />

                  {resumeFile && (
                    <p className="mt-4 text-sm text-blue-400">
                      Selected: {resumeFile.name}
                    </p>
                  )}

                </label>

              </div>

              <div>

                <label className="mb-3 block text-lg font-semibold">
                  Job Description
                </label>

                <textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(
                      e.target.value
                    );
                  }}
                  className="h-64 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

              </div>

              <button
                onClick={analyzeResume}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Analyzing Resume..."
                  : "Analyze Resume"}
              </button>

            </div>
          )}

          {result && (
            <div className="mt-12 space-y-8">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                <p className="text-lg text-slate-400">
                  Resume Match Score
                </p>

                <div className="mt-4 text-7xl font-bold text-blue-500">
                  {result.matchScore}%
                </div>

                <p className="mx-auto mt-4 max-w-xl text-slate-400">
                  {result.scoreMessage}
                </p>

                <p className="mt-4 text-sm text-green-400">
                  ✓ Analysis saved to database
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <h3 className="text-2xl font-bold">
                  🎯 Job Skills Detected
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">

                  {result.requiredSkills.length > 0 ? (
                    result.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400">
                      No supported technical skills detected.
                    </p>
                  )}

                </div>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <h3 className="text-2xl font-bold">
                  ✅ Skills Found In Resume
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">

                  {result.foundSkills.length > 0 ? (
                    result.foundSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400">
                      No matching skills found.
                    </p>
                  )}

                </div>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <h3 className="text-2xl font-bold">
                  ❌ Missing Skills
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">

                  {result.missingSkills.length > 0 ? (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-400"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-green-400">
                      No missing skills detected.
                    </p>
                  )}

                </div>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <h3 className="text-2xl font-bold">
                  💡 Suggestions
                </h3>

                <div className="mt-5 space-y-4">

                  {result.suggestions.map(
                    (suggestion, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-slate-800 p-4 text-slate-300"
                      >
                        {suggestion}
                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <button
                  onClick={startNewAnalysis}
                  className="rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-700"
                >
                  Analyze Another Resume
                </button>

                <button
                  onClick={() => {
                    setShowAnalyzer(false);
                    setShowHistory(true);
                    setResult(null);
                  }}
                  className="rounded-xl border border-slate-700 py-4 font-semibold transition hover:bg-slate-900"
                >
                  View Analysis History
                </button>

              </div>

            </div>
          )}

        </main>

      </div>
    );
  }

  // ==========================
  // HOME PAGE
  // ==========================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5">

        <h1 className="text-2xl font-bold">
          Resume<span className="text-blue-500">AI</span>
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => setShowHistory(true)}
            className="rounded-lg border border-slate-700 px-5 py-2 font-medium transition hover:bg-slate-900"
          >
            History
          </button>

          <button
            onClick={() => setShowAnalyzer(true)}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-700"
          >
            Get Started
          </button>

        </div>

      </nav>

      <main className="mx-auto max-w-5xl px-6 py-24 text-center">

        <div className="mb-6 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          AI-Powered Resume Analysis
        </div>

        <h2 className="text-5xl font-bold leading-tight md:text-6xl">

          Know how well your resume

          <span className="text-blue-500">
            {" "}matches the job.
          </span>

        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">

          Upload your resume and paste a job description.
          ResumeAI analyzes your skills, identifies gaps,
          and stores your analysis history.

        </p>

        <div className="mt-10">

          <button
            onClick={() => setShowAnalyzer(true)}
            className="rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-700"
          >
            Analyze My Resume
          </button>

        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-3xl">
              📄
            </div>

            <h3 className="mt-4 text-xl font-semibold">
              Resume Analysis
            </h3>

            <p className="mt-2 text-slate-400">
              Extract and analyze important information from your resume.
            </p>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-3xl">
              🎯
            </div>

            <h3 className="mt-4 text-xl font-semibold">
              Job Matching
            </h3>

            <p className="mt-2 text-slate-400">
              Compare your technical skills with job requirements.
            </p>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-3xl">
              🗄️
            </div>

            <h3 className="mt-4 text-xl font-semibold">
              Analysis History
            </h3>

            <p className="mt-2 text-slate-400">
              Save and review your previous resume analyses.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;