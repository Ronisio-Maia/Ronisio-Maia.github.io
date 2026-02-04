import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/mdf", (req, res) => {
  const items = db.prepare("SELECT * FROM mdf").all();
  res.json(items);
});

router.get("/fitas", (req, res) => {
  const items = db.prepare("SELECT * FROM fitas").all();
  res.json(items);
});

export default router;
