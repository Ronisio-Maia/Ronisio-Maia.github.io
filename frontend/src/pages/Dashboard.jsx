import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [plans, setPlans] = useState([]);

  const fetchPlans = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:4000/api/plans", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPlans(response.data);
  };

  useEffect(() => {
    fetchPlans().catch(() => setPlans([]));
  }, []);

  const handleStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:4000/api/plans/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchPlans();
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:4000/api/plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchPlans();
  };

  const handlePdf = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:4000/api/plans/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Planos de corte ordenados por data de criação.</p>
        </div>
        <Link className="primary" to="/plans/new">
          Novo Plano
        </Link>
      </header>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Chapas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.id.slice(0, 6)}</td>
                <td>{plan.cliente_nome}</td>
                <td>{new Date(plan.criado_em).toLocaleDateString("pt-BR")}</td>
                <td>{plan.resumo?.mdf?.reduce((sum, item) => sum + item.quantidade_chapas, 0)}</td>
                <td>
                  <select value={plan.status} onChange={(e) => handleStatus(plan.id, e.target.value)}>
                    <option value="novo">Novo</option>
                    <option value="em_producao">Em produção</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>
                <td className="table-actions">
                  <Link to={`/plans/${plan.id}`}>Abrir</Link>
                  <button type="button" className="link-button" onClick={() => handlePdf(plan.id)}>
                    Exportar PDF
                  </button>
                  <button type="button" className="link-button danger" onClick={() => handleDelete(plan.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
