import express from "express";

const app = express();
const PORT = 5003;

app.get("/health", (_, res) => {
  res.json({ service: "Performance", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Performance service running on ${PORT}`);
});
