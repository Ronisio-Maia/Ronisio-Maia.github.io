import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNav = location.pathname === "/login";

  return (
    <div className="app-shell">
      {!hideNav && (
        <aside className="sidebar">
          <h1>Plano de Corte</h1>
          <nav>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/plans/new">Novo Plano</NavLink>
          </nav>
        </aside>
      )}
      <main className="content">{children}</main>
    </div>
  );
};

export default Layout;
