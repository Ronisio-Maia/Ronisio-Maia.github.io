import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";
import { calculatePlan } from "../services/calc.js";
import { buildPdf } from "../services/pdf.js";

const router = express.Router();

const fetchCatalog = () => ({
  mdf: db.prepare("SELECT * FROM mdf").all(),
  fitas: db.prepare("SELECT * FROM fitas").all()
});

router.get("/", (req, res) => {
  const plans = db.prepare("SELECT * FROM planos WHERE user_id = ? ORDER BY criado_em DESC").all(req.user.sub);
  res.json(plans.map((plan) => ({
    ...plan,
    resumo: JSON.parse(plan.resumo_json)
  })));
});

router.get("/:id", (req, res) => {
  const plan = db.prepare("SELECT * FROM planos WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }
  const pieces = db.prepare("SELECT * FROM plano_pecas WHERE plano_id = ?").all(plan.id);
  return res.json({
    ...plan,
    resumo: JSON.parse(plan.resumo_json),
    pecas: pieces
  });
});

router.post("/", (req, res) => {
  const { cliente_nome, ambiente, status, pecas } = req.body;
  if (!cliente_nome || !ambiente || !Array.isArray(pecas) || pecas.length === 0) {
    return res.status(400).json({ error: "Dados do plano incompletos" });
  }

  const catalog = fetchCatalog();
  const summary = calculatePlan(pecas, catalog.mdf, catalog.fitas);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO planos (id, user_id, cliente_nome, ambiente, status, criado_em, atualizado_em, resumo_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.sub, cliente_nome, ambiente, status || "novo", now, now, JSON.stringify(summary));

  const insertPiece = db.prepare(
    `INSERT INTO plano_pecas (id, plano_id, quantidade, largura_mm, altura_mm, espessura_mm, cor_mdf, marca_mdf, descricao, ambiente, fita_selecao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction((rows) => {
    rows.forEach((piece) => {
      insertPiece.run(
        uuidv4(),
        id,
        piece.quantidade,
        piece.largura_mm,
        piece.altura_mm,
        piece.espessura_mm,
        piece.cor_mdf,
        piece.marca_mdf,
        piece.descricao,
        piece.ambiente,
        piece.fita_selecao
      );
    });
  });

  transaction(pecas);

  return res.status(201).json({ id, resumo: summary });
});

router.put("/:id", (req, res) => {
  const plan = db.prepare("SELECT * FROM planos WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }

  const { cliente_nome, ambiente, status, pecas } = req.body;
  const catalog = fetchCatalog();
  const summary = calculatePlan(pecas, catalog.mdf, catalog.fitas);
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE planos SET cliente_nome = ?, ambiente = ?, status = ?, atualizado_em = ?, resumo_json = ?
     WHERE id = ? AND user_id = ?`
  ).run(cliente_nome, ambiente, status || plan.status, now, JSON.stringify(summary), plan.id, req.user.sub);

  db.prepare("DELETE FROM plano_pecas WHERE plano_id = ?").run(plan.id);
  const insertPiece = db.prepare(
    `INSERT INTO plano_pecas (id, plano_id, quantidade, largura_mm, altura_mm, espessura_mm, cor_mdf, marca_mdf, descricao, ambiente, fita_selecao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction((rows) => {
    rows.forEach((piece) => {
      insertPiece.run(
        uuidv4(),
        plan.id,
        piece.quantidade,
        piece.largura_mm,
        piece.altura_mm,
        piece.espessura_mm,
        piece.cor_mdf,
        piece.marca_mdf,
        piece.descricao,
        piece.ambiente,
        piece.fita_selecao
      );
    });
  });

  transaction(pecas);

  return res.json({ id: plan.id, resumo: summary });
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const plan = db.prepare("SELECT * FROM planos WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }

  db.prepare("UPDATE planos SET status = ?, atualizado_em = ? WHERE id = ? AND user_id = ?").run(status, new Date().toISOString(), plan.id, req.user.sub);
  return res.json({ status });
});

router.delete("/:id", (req, res) => {
  const plan = db.prepare("SELECT * FROM planos WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }

  db.prepare("DELETE FROM planos WHERE id = ?").run(plan.id);
  return res.status(204).send();
});

router.get("/:id/pdf", (req, res) => {
  const plan = db.prepare("SELECT * FROM planos WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }

  const summary = JSON.parse(plan.resumo_json);
  return buildPdf(plan, summary, res);
});

export default router;
