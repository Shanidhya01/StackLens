import express from "express";

const app = express();
const PORT = 5002;

app.get("/health", (_, res) => {
  res.json({ service: "Detection", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Detection service running on ${PORT}`);
});
