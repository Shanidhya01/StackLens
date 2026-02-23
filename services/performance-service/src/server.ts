import express from "express";
import performanceRoutes from "./routes/performance.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5003;

app.use(express.json());

app.use("/analyze-performance", performanceRoutes);

app.get("/", (_, res) => {
  res.json({ message: "Welcome to the Performance Service" });
});

app.get("/health", (_, res) => {
  res.json({ service: "Performance", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Performance service running on ${PORT}`);
});