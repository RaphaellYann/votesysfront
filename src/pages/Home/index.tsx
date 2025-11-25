import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  ArrowRight,
  ShieldCheck,
  Speedometer2,
  PeopleFill,
  CheckCircle,
  ListCheck,
  UiChecksGrid,
  BarChartSteps,
  GraphUp,
  PencilSquare,
} from "react-bootstrap-icons";

import "./index.css";

function Home() {
  return (
    <>
      {/* 1. Seção Hero */}
      <Container fluid="xl" className="hero-section text-center text-md-start">
        <Row className="align-items-center">
          <Col md={6}>
            <p className="subtitle text-uppercase">CRIE UMA VOTAÇÃO</p>
            <h1 className="display-4 mb-3">Votação Online Rápida e Fácil</h1>
            <p className="lead mb-4">
              Crie, gerencie e participe de votações de forma transparente e
              intuitiva. A sua opinião é o que move as decisões.
            </p>
            <Button
              as={Link}
              to="/campanha"
              variant="success"
              size="lg"
              className="btn-green"
            >
              Criar uma Campanha <ArrowRight className="ms-1" />
            </Button>
          </Col>
          <Col md={6} className="d-none d-md-block text-center mt-5 mt-md-0">
            <GraphUp size={200} className="text-muted opacity-50" />
          </Col>
        </Row>
      </Container>

      {/* 2. Seção de Estatísticas */}
      <Container fluid="xl" className="stats-section">
        <Row className="g-4">
          <Col md={4}>
            <div className="stat-card">
              <ShieldCheck size={32} className="text-muted mb-2" />
              <h2>Seguro e Confiável</h2>
              <p>Garantia de integridade e sigilo em cada voto.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <Speedometer2 size={32} className="text-muted mb-2" />
              <h2>Rápido e Intuitivo</h2>
              <p>Crie e publique sua campanha em poucos minutos.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <PeopleFill size={32} className="text-muted mb-2" />
              <h2>Resultados Reais</h2>
              <p>Acompanhe o andamento da votação em tempo real.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* 3. Seção de Funcionalidades */}
      <div className="features-section">
        <Container fluid="xl">
          <h2>Recursos para todo tipo de enquete</h2>
          <p className="lead">
            Dos votos mais simples às pesquisas ranqueadas, nossa plataforma
            oferece as ferramentas certas para você coletar as opiniões que
            importam.
          </p>
          <Row className="g-4 justify-content-center">
            <Col md={4} lg={3}>
              <Card className="feature-card">
                <CheckCircle className="feature-icon" />
                <h5>Voto Único</h5>
                <p className="text-muted small">
                  O eleitor pode escolher apenas uma opção.
                </p>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="feature-card">
                <ListCheck className="feature-icon" />
                <h5>Votos Múltiplos</h5>
                <p className="text-muted small">
                  O eleitor pode distribuir votos entre várias opções.
                </p>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="feature-card">
                <UiChecksGrid className="feature-icon" />
                <h5>Seleção Múltipla</h5>
                <p className="text-muted small">
                  O eleitor pode marcar "sim" em quantas opções desejar.
                </p>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="feature-card">
                <BarChartSteps className="feature-icon" />
                <h5>Ranqueado</h5>
                <p className="text-muted small">
                  O eleitor ordena as opções por ordem de preferência.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 4. Seção "Como Fazer" */}
      <Container fluid="xl" className="how-to-section">
        <Row className="align-items-center g-5">
          <Col md={6}>
            <div className="how-to-image-placeholder">
              <PencilSquare />
            </div>
          </Col>
          <Col md={6}>
            <h2>Como criar sua enquete de votação</h2>
            <p>
              Às vezes, você precisa de feedback rápido – seja buscando opiniões
              sobre um novo produto, ou coletando dados para informar uma nova
              campanha, uma votação pode ajudar a reunir informações críticas.
            </p>
            <Button
              as={Link}
              to="/campanha"
              variant="outline-success"
              size="lg"
              className="btn-outline-green"
            >
              Começar a criar <ArrowRight className="ms-1" />
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Home;