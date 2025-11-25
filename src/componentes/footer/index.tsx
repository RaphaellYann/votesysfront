import { Container, Row, Col } from "react-bootstrap";
import "./index.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-white fw-bold mb-3">VoteSys</h5>
            <p className="text-muted small">
              Transparência, segurança e modernidade para suas votações e enquetes online.
            </p>
          </Col>
          <Col md={2}>
            <div className="footer-title">Plataforma</div>
            <a href="#" className="footer-link">Sobre</a>
            <a href="#" className="footer-link">Funcionalidades</a>
            <a href="#" className="footer-link">Preços</a>
          </Col>
          <Col md={2}>
            <div className="footer-title">Suporte</div>
            <a href="#" className="footer-link">Ajuda</a>
            <a href="#" className="footer-link">Termos de Uso</a>
            <a href="#" className="footer-link">Privacidade</a>
          </Col>
          <Col md={4}>
            <div className="footer-title">Contato</div>
            <p className="text-muted small">suporte@votesys.com</p>
          </Col>
        </Row>
        <div className="footer-divider"></div>
        <div className="text-center text-muted small">
          &copy; {new Date().getFullYear()} VoteSys. Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;