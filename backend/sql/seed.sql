INSERT INTO mdf (id, marca, cor, espessura_mm, preco_chapa, largura_mm, altura_mm, area_m2)
VALUES
  ('mdf-1', 'Duratex', 'Branco TX', 18, 260.0, 2750, 1830, 5.0325),
  ('mdf-2', 'Arauco', 'Carvalho', 15, 310.0, 2750, 1850, 5.0875),
  ('mdf-3', 'Guararapes', 'Preto', 6, 150.0, 2750, 1830, 5.0325);

INSERT INTO fitas (id, marca, cor, espessura_compativel_mm, largura_fita_mm, metros_por_rolo, preco_por_rolo, referencia_mdf_id)
VALUES
  ('fita-1', 'Duratex', 'Branco TX', 18, 22, 100, 85.0, 'mdf-1'),
  ('fita-2', 'Duratex', 'Branco TX', 18, 15, 100, 65.0, 'mdf-1'),
  ('fita-3', 'Arauco', 'Carvalho', 15, 22, 100, 92.0, 'mdf-2'),
  ('fita-4', 'Guararapes', 'Preto', 6, 22, 100, 70.0, 'mdf-3');
