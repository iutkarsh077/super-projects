import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzePost = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const getAnswer = (key) => {
    return result?.[key];
  };

  return (
    <div className="app">

      <div className="header">
        <div className="logo">
          <span>𝕏</span>
          <div>
            <h1>Slop Detector</h1>
            <p>Powered by Jev</p>
          </div>
        </div>
      </div>

      <div className="content">

        <textarea
          placeholder="Paste an X post..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={analyzePost}
          disabled={loading || !text.trim()}
        >
          {loading ? "Analyzing..." : "Analyze Post"}
        </button>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {result && (
          <div className="results">

            <div className="result-card">
              <span>AI Slop</span>

              <strong>
                {getAnswer("ai_slop")?.noul >= 0.5
                  ? "Likely"
                  : "Unlikely"}
              </strong>

              <small>
                Confidence:{" "}
                {Math.round(
                  (getAnswer("ai_slop")?.noul || 0) * 100
                )}
                %
              </small>
            </div>

            <div className="result-card">
              <span>Slop Score</span>

              <strong>
                {getAnswer("slop_score")?.score ?? "-"}
                / 5
              </strong>
            </div>

            <div className="result-card">
              <span>Content Type</span>

              <strong>
                {getAnswer("content_type")?.choice || "-"}
              </strong>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;