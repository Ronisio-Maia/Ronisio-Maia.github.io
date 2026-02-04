import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { nome, email, senha, empresa_cnpj, endereco, cep, telefone } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) {
    return res.status(409).json({ error: "E-mail já cadastrado" });
  }

  const senha_hash = bcrypt.hashSync(senha, 10);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO users (id, nome, email, senha_hash, empresa_cnpj, endereco, cep, telefone, data_cadastro)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, nome, email, senha_hash, empresa_cnpj || "", endereco || "", cep || "", telefone || "", now);

  return res.status(201).json({ id, nome, email });
});

router.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !user.senha_hash) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const ok = bcrypt.compareSync(senha, user.senha_hash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "8h" });
  return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
});

router.post("/google", (req, res) => {
  const { google_id, email, nome } = req.body;
  if (!google_id || !email) {
    return res.status(400).json({ error: "Google ID e email são obrigatórios" });
  }

  let user = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(google_id, email);
  if (!user) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO users (id, nome, email, google_id, data_cadastro)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, nome || "Usuário Google", email, google_id, now);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "8h" });
  return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
});

router.post("/forgot", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }

  return res.json({ message: "Se o e-mail existir, enviaremos instruções." });
});

export default router;
