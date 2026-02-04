import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", { email, senha });
      localStorage.setItem("token", response.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Falha no login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <h2>Acesse sua conta</h2>
        <p>Entre para gerenciar seus planos de corte.</p>
        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Senha
            <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required />
          </label>
          {error && <span className="error">{error}</span>}
          <button type="submit">Entrar</button>
        </form>
        <button className="google-button" type="button">
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

export default Login;
