import { NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import {
  CardChecklist,
  HouseFill,
  ArchiveFill,
  BoxArrowRight,
  BoxArrowInRight,
  Person,
  PersonCircle,
  BarChartLineFill,
} from "react-bootstrap-icons";

import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../redux/store";
import { logout } from "../../redux/authSlice";

import "./index.css";

const Header = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isAutenticado, usuario } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const canAccessCampaigns =
    usuario?.role === "ROLE_ADMIN_GERAL" ||
    usuario?.role === "ROLE_ADMIN_NORMAL";

  const isGeneralAdmin = usuario?.role === "ROLE_ADMIN_GERAL";

  return (
    <Navbar expand="lg" className="app-header" variant="light">
      <Container fluid="xl">
        <Navbar.Brand as={NavLink} to="/">
          <CardChecklist size={28} className="me-2" />
          VoteSys
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav-bar" />
        <Navbar.Collapse id="nav-bar">
          <Nav className="me-auto gap-2">
            <Nav.Link as={NavLink} to="/" end>
              <HouseFill className="me-1" /> Home
            </Nav.Link>

            {isAutenticado && (
              <>
                {canAccessCampaigns && (
                  <Nav.Link as={NavLink} to="/campanha">
                    <ArchiveFill className="me-1" /> Campanhas
                  </Nav.Link>
                )}

                <Nav.Link as={NavLink} to="/votacao">
                  <CardChecklist className="me-1" /> Votações
                </Nav.Link>

                <Nav.Link as={NavLink} to="/resultados">
                  <BarChartLineFill className="me-1" /> Resultados
                </Nav.Link>

                {isGeneralAdmin && (
                  <Nav.Link as={NavLink} to="/usuarioAdmin">
                    <Person className="me-1" /> Usuários
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          
          <Nav className="align-items-lg-center gap-2">
            {isAutenticado ? (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/perfil"
                  className="d-flex align-items-center text-success fw-medium"
                  title="Meu Perfil"
                >
                  <PersonCircle size={20} className="me-1" />
                  <span className="d-lg-none d-xl-inline">
                    {usuario?.nome?.split(" ")[0]}
                  </span>
                </Nav.Link>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="btn-logout d-flex align-items-center"
                >
                  <BoxArrowRight className="me-1" /> Sair
                </Button>
              </>
            ) : (
              <Button
                as={NavLink}
                to="/login"
                variant="outline-success"
                className="d-flex align-items-center"
              >
                <BoxArrowInRight className="me-1" /> Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;