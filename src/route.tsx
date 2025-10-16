import React from 'react'; 
import { Route, Routes, Navigate } from "react-router-dom"; 

// Layouts
import LayoutAdmin from "./componentes/LayoutAdmin";
import LayoutLogin from "./componentes/LayoutLogin";

// Páginas
import Login from "./pages/Login";
import Home from "./pages/Home";
import Usuario from "./pages/Usuario";
import Cadastrese from "./pages/Cadastrese";
import Campanha from "./pages/Campanha";
import VotacaoPage from './pages/Votacao';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<LayoutLogin />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastrese" element={<Cadastrese />} />
      </Route>

      <Route 
        element={
          <PrivateRoute>
            <LayoutAdmin />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/campanha" element={<Campanha />} />
         <Route path="/votacao" element={<VotacaoPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;