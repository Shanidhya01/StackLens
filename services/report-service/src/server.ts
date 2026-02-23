import express from "express";
import reportRoutes from "./routes/report.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5004;

app.use(express.json());

app.use("/generate-report", reportRoutes);

app.get("/", (_, res) => {
  res.json({ message: "Welcome to the Report Service" });
});

app.get("/health", (_, res) => {
  res.json({ service: "Report", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Report service running on ${PORT}`);
});