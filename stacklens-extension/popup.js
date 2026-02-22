const analyzeBtn = document.getElementById("analyzeBtn");
const loadingDiv = document.getElementById("loading");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");

const frameworkSpan = document.getElementById("framework");
const hostingSpan = document.getElementById("hosting");
const scoreSpan = document.getElementById("score");

analyzeBtn.addEventListener("click", async () => {
  errorDiv.classList.add("hidden");
  resultDiv.classList.add("hidden");
  loadingDiv.classList.remove("hidden");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const url = tab.url;

    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = await response.json();

    frameworkSpan.textContent = data.raw.detection.framework;
    hostingSpan.textContent = data.raw.detection.hosting;
    scoreSpan.textContent = data.report.overallScore;

    loadingDiv.classList.add("hidden");
    resultDiv.classList.remove("hidden");

  } catch (err) {
    loadingDiv.classList.add("hidden");
    errorDiv.textContent = "Failed to analyze this page.";
    errorDiv.classList.remove("hidden");
  }
});