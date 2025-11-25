import { Outlet } from "react-router-dom";
// Importa o novo CSS
import "./index.css";

function LayoutLogin() {
  return (
    <div className="login-layout-container">
      <div className="login-brand-col">
        <div className="brand-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
            alt="Logo"
          />
          <h1>VoteSys</h1>
        </div>
      </div>

      <div className="login-form-col">
        <div className="login-form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutLogin;
