import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ service: "Gateway", status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Gateway running on ${PORT}`);
});
