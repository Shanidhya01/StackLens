import express from "express";
import analyzeRoutes from "./routes/analyze.routes";

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/analyze", analyzeRoutes);

app.get("/health", (_, res) => {
  res.json({ service: "Gateway", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Gateway running on ${PORT}`);
});
