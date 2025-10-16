import { Link } from 'react-router-dom';
import { ShieldCheck, PeopleFill, GraphUp, ArrowRight } from 'react-bootstrap-icons';

function Home() {
  return (
    // Usamos um container para centralizar e limitar a largura do conteúdo
    <div className="container my-5">
      {/* 1. Seção de Herói (Jumbotron) */}
      <div className="p-5 mb-5 text-center bg-light rounded-3 shadow-sm">
        <h1 className="display-4 fw-bold">Sistema de Votação Moderno</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          Crie, gerencie e participe de votações de forma transparente e intuitiva. A sua opinião é o que move as decisões.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
          <Link to="/votacao" className="btn btn-primary btn-lg px-4 gap-3 d-inline-flex align-items-center">
            Ver Votações Abertas
            <ArrowRight />
          </Link>
          <Link to="/campanha" className="btn btn-outline-secondary btn-lg px-4">
            Criar uma Campanha
          </Link>
        </div>
      </div>

      {/* 2. Seção de Funcionalidades */}
      <div className="row text-center g-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <ShieldCheck size={40} className="text-primary mb-3" />
              <h4 className="fw-bold">Seguro e Confiável</h4>
              <p className="text-muted">Garantimos a integridade e o sigilo de cada voto registrado na plataforma.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <PeopleFill size={40} className="text-primary mb-3" />
              <h4 className="fw-bold">Fácil de Usar</h4>
              <p className="text-muted">Interface intuitiva para que qualquer pessoa possa criar ou participar de uma votação.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <GraphUp size={40} className="text-primary mb-3" />
              <h4 className="fw-bold">Resultados em Tempo Real</h4>
              <p className="text-muted">Acompanhe o andamento das votações e veja os resultados assim que a apuração é concluída.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;