import express from "express";
import cors from "cors";
import crawlRoutes from "./routes/crawl.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

app.use("/crawl", crawlRoutes);

app.get("/", (_, res) => {
  res.json({ message: "Welcome to the Crawler Service" });
});

app.get("/health", (_, res) => {
  res.json({ service: "Crawler", status: "OK" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Crawler service running on ${PORT}`);
  });
}

export default app;
