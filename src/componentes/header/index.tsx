import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Verifica imediatamente quando monta
    checkToken();

    // Verifica a cada 5 segundos (pode ajustar esse intervalo)
    const interval = setInterval(checkToken, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="bg-light py-3 shadow-sm">
      <nav className="container d-flex align-items-center">
        <div className="d-flex gap-4 mx-auto">
          <Link to="/" className="text-secondary text-decoration-none">
            Home
          </Link>
          <Link to="/campanha" className="text-secondary text-decoration-none">
            Campanhas
          </Link>
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger ms-auto"
          >
            Sair
          </button>
        ) : (
          <Link to="/login" className="btn btn-outline-primary ms-auto">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
