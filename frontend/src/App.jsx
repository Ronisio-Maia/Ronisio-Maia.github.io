import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewPlan from "./pages/NewPlan.jsx";
import PlanDetails from "./pages/PlanDetails.jsx";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/plans/new" element={<NewPlan />} />
      <Route path="/plans/:id" element={<PlanDetails />} />
    </Routes>
  </Layout>
);

export default App;
