import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store"; 
import Rotas from "./route"; 
import { adicionarNavegacao } from "./redux/authSlice"; // Certifique-se que o caminho está certo

// --- O ESPIÃO ---
// Esse componente invisível monitora cada clique seu
const RotaTracker = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Envia a rota atual para o Redux
    dispatch(adicionarNavegacao(location.pathname));
  }, [location, dispatch]);

  return null;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <RotaTracker /> {/* O Espião fica aqui dentro */}
        <Rotas /> 
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);