import express from "express";

const app = express();
const PORT = 5004;

app.get("/health", (_, res) => {
  res.json({ service: "Report", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Report service running on ${PORT}`);
});
