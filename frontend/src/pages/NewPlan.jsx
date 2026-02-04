import React, { useEffect, useState } from "react";
import axios from "axios";

const emptyPiece = {
  quantidade: 1,
  largura_mm: 600,
  altura_mm: 400,
  espessura_mm: 18,
  cor_mdf: "Branco TX",
  marca_mdf: "Duratex",
  descricao: "Prateleira",
  ambiente: "Cozinha",
  fita_selecao: "1x_menor_1x_maior"
};

const NewPlan = () => {
  const [clienteNome, setClienteNome] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [pieces, setPieces] = useState([emptyPiece]);
  const [materials, setMaterials] = useState({ mdf: [], fitas: [] });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      const token = localStorage.getItem("token");
      const [mdf, fitas] = await Promise.all([
        axios.get("http://localhost:4000/api/materials/mdf", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:4000/api/materials/fitas", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMaterials({ mdf: mdf.data, fitas: fitas.data });
    };

    fetchMaterials().catch(() => setMaterials({ mdf: [], fitas: [] }));
  }, []);

  const updatePiece = (index, field, value) => {
    const updated = [...pieces];
    updated[index] = { ...updated[index], [field]: value };
    setPieces(updated);
  };

  const updateMdfSelection = (index, mdfId) => {
    const mdf = materials.mdf.find((item) => item.id === mdfId);
    if (!mdf) return;
    const updated = [...pieces];
    updated[index] = {
      ...updated[index],
      marca_mdf: mdf.marca,
      cor_mdf: mdf.cor,
      espessura_mm: mdf.espessura_mm
    };
    setPieces(updated);
  };

  const addPiece = () => setPieces([...pieces, emptyPiece]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:4000/api/plans",
      {
        cliente_nome: clienteNome,
        ambiente,
        status: "novo",
        pecas: pieces
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setSummary(response.data.resumo);
  };

  return (
    <section>
      <header className="page-header">
        <h2>Novo Plano de Corte</h2>
        <p>Preencha os dados e gere seu cálculo automaticamente.</p>
      </header>
      <form className="card" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            Cliente
            <input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} required />
          </label>
          <label>
            Ambiente
            <input value={ambiente} onChange={(e) => setAmbiente(e.target.value)} required />
          </label>
        </div>

        <h3>Peças</h3>
        {pieces.map((piece, index) => (
          <div className="piece-grid" key={index}>
            <input
              type="number"
              min="1"
              value={piece.quantidade}
              onChange={(e) => updatePiece(index, "quantidade", Number(e.target.value))}
              placeholder="Qtd"
            />
            <input
              type="number"
              value={piece.largura_mm}
              onChange={(e) => updatePiece(index, "largura_mm", Number(e.target.value))}
              placeholder="Largura (mm)"
            />
            <input
              type="number"
              value={piece.altura_mm}
              onChange={(e) => updatePiece(index, "altura_mm", Number(e.target.value))}
              placeholder="Altura (mm)"
            />
            <select
              value={
                materials.mdf.find(
                  (mdf) =>
                    mdf.marca === piece.marca_mdf &&
                    mdf.cor === piece.cor_mdf &&
                    mdf.espessura_mm === piece.espessura_mm
                )?.id || ""
              }
              onChange={(e) => updateMdfSelection(index, e.target.value)}
            >
              <option value="">Selecione o MDF</option>
              {materials.mdf.map((mdf) => (
                <option key={mdf.id} value={mdf.id}>
                  {mdf.marca} {mdf.cor} ({mdf.espessura_mm}mm)
                </option>
              ))}
            </select>
            <input
              value={piece.cor_mdf}
              onChange={(e) => updatePiece(index, "cor_mdf", e.target.value)}
              placeholder="Cor"
              required
            />
            <input
              value={piece.marca_mdf}
              onChange={(e) => updatePiece(index, "marca_mdf", e.target.value)}
              placeholder="Marca"
              required
            />
            <input
              value={piece.descricao}
              onChange={(e) => updatePiece(index, "descricao", e.target.value)}
              placeholder="Descrição"
            />
            <input
              value={piece.ambiente}
              onChange={(e) => updatePiece(index, "ambiente", e.target.value)}
              placeholder="Ambiente"
            />
            <select
              value={piece.fita_selecao}
              onChange={(e) => updatePiece(index, "fita_selecao", e.target.value)}
            >
              <option value="1x_menor">1x lado menor</option>
              <option value="1x_maior">1x lado maior</option>
              <option value="1x_menor_1x_maior">1x menor + 1x maior</option>
              <option value="2x_menor">2x lado menor</option>
              <option value="2x_maior">2x lado maior</option>
              <option value="1x_menor_2x_maior">1x menor + 2x maior</option>
              <option value="2x_maior_1x_menor">2x maior + 1x menor</option>
              <option value="nenhum">Nenhum</option>
            </select>
          </div>
        ))}
        <button type="button" className="ghost" onClick={addPiece}>
          Adicionar peça
        </button>
        <button className="primary" type="submit">
          Calcular e Salvar
        </button>
      </form>

      {summary && (
        <section className="card">
          <h3>Resumo</h3>
          <p>Área utilizada: {summary.totais.area_utilizada_m2} m²</p>
          <p>Área perdida: {summary.totais.area_perdida_m2} m²</p>
          <p>Total MDF: R$ {summary.totais.custo_mdf}</p>
          <p>Total Fitas: R$ {summary.totais.custo_fitas}</p>
          <p>Total Geral: R$ {summary.totais.custo_total}</p>
        </section>
      )}
    </section>
  );
};

export default NewPlan;
