import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PlanDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [materials, setMaterials] = useState({ mdf: [], fitas: [] });
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState(null);
  const [status, setStatus] = useState("");

  const fetchPlan = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:4000/api/plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPlan(response.data);
    setFormState({
      cliente_nome: response.data.cliente_nome,
      ambiente: response.data.ambiente,
      status: response.data.status,
      pecas: response.data.pecas
    });
    setStatus(response.data.status);
  };

  useEffect(() => {
    fetchPlan().catch(() => setPlan(null));
  }, [id]);

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

  if (!plan || !formState) {
    return <p>Carregando...</p>;
  }

  const handlePdf = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:4000/api/plans/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:4000/api/plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    window.location.href = "/dashboard";
  };

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:4000/api/plans/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchPlan();
  };

  const updatePiece = (index, field, value) => {
    const updated = [...formState.pecas];
    updated[index] = { ...updated[index], [field]: value };
    setFormState({ ...formState, pecas: updated });
  };

  const addPiece = () => {
    setFormState({
      ...formState,
      pecas: [
        ...formState.pecas,
        {
          quantidade: 1,
          largura_mm: 600,
          altura_mm: 400,
          espessura_mm: 18,
          cor_mdf: "Branco TX",
          marca_mdf: "Duratex",
          descricao: "Peça",
          ambiente: "Ambiente",
          fita_selecao: "1x_menor_1x_maior"
        }
      ]
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:4000/api/plans/${id}`,
      formState,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditing(false);
    await fetchPlan();
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Plano {plan.cliente_nome}</h2>
          <p>{plan.ambiente}</p>
        </div>
        <div className="actions">
          <button className="ghost" type="button" onClick={() => setEditing((prev) => !prev)}>
            {editing ? "Cancelar" : "Editar"}
          </button>
          <button className="primary" onClick={handlePdf} type="button">
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="card">
        <div className="status-row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="novo">Novo</option>
              <option value="em_producao">Em produção</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </label>
          <button className="primary" type="button" onClick={handleStatusUpdate}>
            Atualizar status
          </button>
          <button className="danger" type="button" onClick={handleDelete}>
            Excluir
          </button>
        </div>
      </div>

      {editing ? (
        <form className="card" onSubmit={handleSave}>
          <div className="grid">
            <label>
              Cliente
              <input
                value={formState.cliente_nome}
                onChange={(e) => setFormState({ ...formState, cliente_nome: e.target.value })}
              />
            </label>
            <label>
              Ambiente
              <input value={formState.ambiente} onChange={(e) => setFormState({ ...formState, ambiente: e.target.value })} />
            </label>
          </div>
          <h3>Peças</h3>
          {formState.pecas.map((piece, index) => (
            <div className="piece-grid" key={piece.id || index}>
              <input
                type="number"
                min="1"
                value={piece.quantidade}
                onChange={(e) => updatePiece(index, "quantidade", Number(e.target.value))}
              />
              <input
                type="number"
                value={piece.largura_mm}
                onChange={(e) => updatePiece(index, "largura_mm", Number(e.target.value))}
              />
              <input
                type="number"
                value={piece.altura_mm}
                onChange={(e) => updatePiece(index, "altura_mm", Number(e.target.value))}
              />
              <select
                value={piece.espessura_mm}
                onChange={(e) => updatePiece(index, "espessura_mm", Number(e.target.value))}
              >
                {materials.mdf.map((mdf) => (
                  <option key={mdf.id} value={mdf.espessura_mm}>
                    {mdf.espessura_mm}mm
                  </option>
                ))}
              </select>
              <input
                value={piece.cor_mdf}
                onChange={(e) => updatePiece(index, "cor_mdf", e.target.value)}
                placeholder="Cor"
              />
              <input
                value={piece.marca_mdf}
                onChange={(e) => updatePiece(index, "marca_mdf", e.target.value)}
                placeholder="Marca"
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
              <select value={piece.fita_selecao} onChange={(e) => updatePiece(index, "fita_selecao", e.target.value)}>
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
            Salvar alterações
          </button>
        </form>
      ) : (
        <div className="card">
          <h3>Resumo de MDF</h3>
          <ul>
            {plan.resumo.mdf.map((item) => (
              <li key={`${item.marca}-${item.cor}-${item.espessura_mm}`}>
                {item.marca} {item.cor} ({item.espessura_mm}mm) - {item.quantidade_chapas} chapas - R$ {item.custo_total}
              </li>
            ))}
          </ul>
          <h3>Resumo de Fitas</h3>
          <ul>
            {plan.resumo.fitas.map((item) => (
              <li key={`${item.cor}-${item.espessura_mm}`}>
                {item.cor} ({item.espessura_mm}mm) - {item.metros} m - {item.rolos} rolos
              </li>
            ))}
          </ul>
          <h3>Peças</h3>
          <ul>
            {plan.pecas.map((piece) => (
              <li key={piece.id}>
                {piece.quantidade}x {piece.descricao} ({piece.largura_mm}x{piece.altura_mm}mm) - {piece.marca_mdf} {piece.cor_mdf}
              </li>
            ))}
          </ul>
          <h3>Totais</h3>
          <p>Área utilizada: {plan.resumo.totais.area_utilizada_m2} m²</p>
          <p>Área perdida: {plan.resumo.totais.area_perdida_m2} m²</p>
          <p>Valor final: R$ {plan.resumo.totais.custo_total}</p>
        </div>
      )}
    </section>
  );
};

export default PlanDetails;
