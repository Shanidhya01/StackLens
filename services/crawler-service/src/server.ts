import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ service: "Crawler", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Crawler service running on ${PORT}`);
});
