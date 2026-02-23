import express from "express";
import analyzeRoutes from "./routes/analyze.routes";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import historyRoutes from "./routes/history.routes";
import cors from "cors";

dotenv.config();


const app = express();
const PORT = Number(process.env.PORT) || 5000;

connectDB();
app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json());

app.use("/analyze", analyzeRoutes);
app.use("/history", historyRoutes);

app.get("/", (_, res) => {
  res.json({ message: "Welcome to the Gateway Service" });
});

app.get("/health", (_, res) => {
  res.json({ service: "Gateway", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Gateway running on ${PORT}`);
});
