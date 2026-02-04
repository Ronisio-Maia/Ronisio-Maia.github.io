import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import materialRoutes from "./routes/materials.js";
import planRoutes from "./routes/plans.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Plano de Corte" });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", authMiddleware, materialRoutes);
app.use("/api/plans", authMiddleware, planRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
