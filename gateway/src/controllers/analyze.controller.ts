import axios from "axios";

export const analyzeHandler = async (req: any, res: any) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Step 1: Call Crawler
    const crawlResponse = await axios.post(
      "http://crawler:5001/crawl",
      { url }
    );

    // Step 2: Call Detection
    const detectResponse = await axios.post(
      "http://detection:5002/detect",
      crawlResponse.data
    );

    res.json({
      message: "Analysis successful",
      detection: detectResponse.data
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Analysis failed",
      details: error.message
    });
  }
};