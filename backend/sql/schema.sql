PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT,
  google_id TEXT,
  empresa_cnpj TEXT,
  endereco TEXT,
  cep TEXT,
  telefone TEXT,
  data_cadastro TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mdf (
  id TEXT PRIMARY KEY,
  marca TEXT NOT NULL,
  cor TEXT NOT NULL,
  espessura_mm INTEGER NOT NULL,
  preco_chapa REAL NOT NULL,
  largura_mm INTEGER NOT NULL,
  altura_mm INTEGER NOT NULL,
  area_m2 REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS fitas (
  id TEXT PRIMARY KEY,
  marca TEXT NOT NULL,
  cor TEXT NOT NULL,
  espessura_compativel_mm INTEGER NOT NULL,
  largura_fita_mm INTEGER NOT NULL,
  metros_por_rolo REAL NOT NULL,
  preco_por_rolo REAL NOT NULL,
  referencia_mdf_id TEXT,
  FOREIGN KEY (referencia_mdf_id) REFERENCES mdf(id)
);

CREATE TABLE IF NOT EXISTS planos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  ambiente TEXT NOT NULL,
  status TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  resumo_json TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS plano_pecas (
  id TEXT PRIMARY KEY,
  plano_id TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  largura_mm INTEGER NOT NULL,
  altura_mm INTEGER NOT NULL,
  espessura_mm INTEGER NOT NULL,
  cor_mdf TEXT NOT NULL,
  marca_mdf TEXT NOT NULL,
  descricao TEXT NOT NULL,
  ambiente TEXT NOT NULL,
  fita_selecao TEXT NOT NULL,
  FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE
);
