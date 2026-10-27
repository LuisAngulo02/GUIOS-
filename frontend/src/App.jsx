import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EvaluationProvider, useEvaluation } from "./context/EvaluationContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configuracion from "./pages/Configuracion";
import FactoresRelevantes from "./pages/FactoresRelevantes";
import EvaluacionSubfactores from "./pages/EvaluacionSubfactores";
import ResultadoDictamen from "./pages/ResultadoDictamen";
import Evidencia from "./pages/Evidencia";
import Administracion from "./pages/Administracion";

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useEvaluation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && currentUser.rol !== "Administrador") {
    alert("Se requieren privilegios de Administrador para acceder a esta sección.");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <EvaluationProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas bajo el Layout Común de GUIOS+ */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="factores" element={<FactoresRelevantes />} />
            <Route path="subfactores" element={<EvaluacionSubfactores />} />
            <Route path="resultado" element={<ResultadoDictamen />} />
            <Route path="evidencia" element={<Evidencia />} />
            <Route
              path="administracion"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Administracion />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </EvaluationProvider>
  );
}

export default App;
