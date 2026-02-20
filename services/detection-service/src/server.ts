import express from "express";
import detectRoutes from "./routes/detect.routes";

const app = express();
const PORT = 5002;

app.use(express.json());

app.use("/detect", detectRoutes);

app.get("/health", (_, res) => {
  res.json({ service: "Detection", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Detection service running on ${PORT}`);
});