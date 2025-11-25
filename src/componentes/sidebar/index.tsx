import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo"; 


import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store"; 

const SideBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 
  

  const { isAutenticado, usuario } = useSelector((state: RootState) => state.auth);

  const isAdmin = usuario?.role === 'ADMIN';


  const handleToggle = () => {
    setIsOpen(!isOpen);
  };


  const sidebarStyle: React.CSSProperties = { 
    width: "280px", 
    transform: isOpen ? "translateX(0)" : "translateX(-100%)", 
    transition: "transform 0.3s ease-in-out", 
    position: 'fixed', 
    zIndex: 100, 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    flexShrink: 0, 
    backgroundColor: '#f8f9fa', 
    padding: '1.5rem', 
    boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)', 
  };    

  const toggleButtonStyle: React.CSSProperties = { 
    position: 'fixed', 
    left: isOpen ? '250px' : '10px', 
    top: '15px', 
    zIndex: 101, 
    transition: 'left 0.3s ease-in-out', 
    background: 'transparent', 
    border: 'none', 
    width: '40px', 
    height: '40px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '2rem', 
    color: 'black', 
    cursor: 'pointer', 
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '430px', 
    textAlign: 'center', 
    padding: '1rem 0', 
    marginBottom: '20px', 
  };


  return (
    <>
      {isAutenticado && (
         <button style={toggleButtonStyle} onClick={handleToggle}>
           {isOpen ? "‹" : "›"}
         </button>
      )}


      {isAutenticado && (
        <div style={sidebarStyle}>
          <div className="text-center mb-4">
            <Logo /> 
          </div>

          <nav>
            <ul className="nav flex-column list-unstyled">
              <li className="nav-item">
                <Link to="/" className="nav-link text-secondary">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-secondary"
                  href="#submenuCadastro"
                  data-bs-toggle="collapse"
                  role="button"
                  aria-expanded="false"
                  aria-controls="submenuCadastro"
                >
                  Cadastro
                </a>
                <ul className="collapse list-unstyled ps-3" id="submenuCadastro">
                  
                  {isAdmin && (
                    <li>
                      <Link to="/usuario" className="nav-link text-secondary py-1">
                        Usuário
                      </Link>
                    </li>
                  )}
                  
                  <li>
                    <Link to="/carrinho" className="nav-link text-secondary py-1">
                      Carrinho
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          <p style={footerStyle} className="mb-0">
            &copy; {new Date().getFullYear()} VoteSys. Todos direitos reservados.
          </p>
        </div>
      )}
    </>
  );
};

export default SideBar;