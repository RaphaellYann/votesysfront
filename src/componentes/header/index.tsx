import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { BoxArrowInRight, BoxArrowRight, HouseFill, ArchiveFill, CardChecklist } from 'react-bootstrap-icons';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Lógica para verificar o token de login
    const checkToken = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkToken();
    // Você pode adicionar um listener de evento ou um intervalo se necessário
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    // Navbar escura, que se expande em telas grandes (lg) e fica fixa no topo
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <CardChecklist size={24} className="me-2" />
          VoteSys
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-2">
              <HouseFill /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/campanha" className="d-flex align-items-center gap-2">
              <ArchiveFill /> Campanhas
            </Nav.Link>
            <Nav.Link as={Link} to="/votacao" className="d-flex align-items-center gap-2">
              <CardChecklist /> Votações Abertas
            </Nav.Link>
            {/* Adicione outros links de navegação aqui */}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <Button variant="outline-danger" onClick={handleLogout} className="d-flex align-items-center gap-2">
                <BoxArrowRight /> Sair
              </Button>
            ) : (
              <Button as={Link} to="/login" variant="outline-primary" className="d-flex align-items-center gap-2">
                <BoxArrowInRight /> Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;