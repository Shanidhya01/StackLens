import axios from "axios";

export const analyzeHandler = async (req: any, res: any) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const crawlerResponse = await axios.post(
      `http://crawler:5001/crawl`,
      { url }
    );
    res.json({
      message: "Crawl successful via Gateway",
      data: crawlerResponse.data
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Crawler Service Failed",
      details : error.message
    })
  }
}