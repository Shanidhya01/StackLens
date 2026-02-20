import express from "express";
import performanceRoutes from "./routes/performance.routes";

const app = express();
const PORT = 5003;

app.use(express.json());

app.use("/analyze-performance", performanceRoutes);

app.get("/health", (_, res) => {
  res.json({ service: "Performance", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Performance service running on ${PORT}`);
});