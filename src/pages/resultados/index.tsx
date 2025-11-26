import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Spinner,
  ListGroup,
  ProgressBar,
  Alert
} from "react-bootstrap";
import "./index.css";
import { TrophyFill, BarChartLineFill } from "react-bootstrap-icons";

import Trofeus from "../../componentes/trofeus";

import { buscarCampanhasParaResultados, type Campanha } from "../../services/campanhaService";
import { buscarOpcoesPorCampanha, type OpcaoVoto } from "../../services/opcaoVotoService";

function Resultados() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [selectedCampanhaId, setSelectedCampanhaId] = useState<number | string>("");
  const [opcoes, setOpcoes] = useState<OpcaoVoto[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampanhas = async () => {
      try {
        const data = await buscarCampanhasParaResultados();
        
        setCampanhas(data);

        if (data.length > 0) {

             const ativa = data.find(c => c.ativo) || data[0];
             setSelectedCampanhaId(ativa.id);
        } else {
             setSelectedCampanhaId("");
        }

      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o histórico de votações.");
      }
    };
    loadCampanhas();
  }, []); 


  useEffect(() => {
    if (!selectedCampanhaId) {
        setOpcoes([]);
        return;
    }

    const loadResultados = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await buscarOpcoesPorCampanha(Number(selectedCampanhaId));
        

        const ordenadas = data.sort((a, b) => b.totalVotos - a.totalVotos);
        setOpcoes(ordenadas);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o placar desta campanha.");
        setOpcoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResultados();
  }, [selectedCampanhaId]);

  const campanhaAtual = campanhas.find(c => c.id === Number(selectedCampanhaId));
  
  // Cálculos Auxiliares
  const maxVotos = opcoes.length > 0 ? opcoes[0].totalVotos : 1;
  const totalVotosGeral = opcoes.reduce((acc, curr) => acc + curr.totalVotos, 0);

  const getPercent = (votos: number) => {
    if (totalVotosGeral === 0) return "0.0";
    return ((votos / totalVotosGeral) * 100).toFixed(1);
  };

  return (
    <Container fluid="xl" className="mt-4">
      <div className="d-flex justify-content-between align-items-center page-header flex-wrap gap-3">
        <div className="d-flex align-items-center">
          <BarChartLineFill size={28} className="me-3 text-success" />
          <h4 className="mb-0">Resultados da Votação</h4>
        </div>
        
        <div style={{ minWidth: '300px' }}>
          <Form.Select 
            value={selectedCampanhaId} 
            onChange={(e) => setSelectedCampanhaId(e.target.value)}
            className="form-select-lg border-success shadow-sm"
            disabled={campanhas.length === 0}
          >
            <option value="">
                {campanhas.length === 0 
                    ? "Nenhuma campanha encontrada"
                    : "Selecione uma campanha..."}
            </option>
            {campanhas.map(c => (
              <option key={c.id} value={c.id}>
                {c.titulo} {c.ativo ? '(Em Andamento)' : '(Finalizada)'}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {isLoading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-2">Apurando votos...</p>
        </div>
      ) : selectedCampanhaId && opcoes.length > 0 ? (
        <>
          {/* --- PODIUM (TOP 3) --- */}
          <div className="podium-container">
            
            {/* 2º Lugar */}
            {opcoes[1] ? (
              <div className="podium-item podium-2">
                <div className="podium-rank">2</div>
                <TrophyFill size={40} className="trophy-floating text-secondary" />
                <div className="podium-box shadow">
                  <TrophyFill size={24} className="mb-2 opacity-75 icon-static" />
                  <div className="podium-name">{opcoes[1].nome}</div>
                  <div className="podium-stats">
                    <span className="votes-num">{opcoes[1].totalVotos} pts</span>
                    <span className="votes-percent">{getPercent(opcoes[1].totalVotos)}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="podium-item podium-2 invisible"></div> }

            {/* 1º Lugar */}
            {opcoes[0] && (
              <div className="podium-item podium-1">
                <div className="podium-rank">1</div>
                <TrophyFill size={56} className="trophy-floating text-warning trophy-gold" />
                <div className="podium-box shadow">
                  <TrophyFill size={40} className="mb-3 icon-static" /> 
                  <div className="podium-name text-uppercase fs-5">{opcoes[0].nome}</div>
                  <div className="podium-stats">
                    <span className="votes-num fs-5">{opcoes[0].totalVotos} pts</span>
                    <span className="votes-percent badge bg-warning text-dark mt-1">
                        {getPercent(opcoes[0].totalVotos)}% dos votos
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3º Lugar */}
            {opcoes[2] ? (
              <div className="podium-item podium-3">
                <div className="podium-rank">3</div>
                <TrophyFill size={40} className="trophy-floating" style={{ color: '#cd7f32' }} />
                <div className="podium-box shadow">
                  <TrophyFill size={24} className="mb-2 opacity-75 icon-static" />
                  <div className="podium-name">{opcoes[2].nome}</div>
                  <div className="podium-stats">
                    <span className="votes-num">{opcoes[2].totalVotos} pts</span>
                    <span className="votes-percent">{getPercent(opcoes[2].totalVotos)}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="podium-item podium-3 invisible"></div>}
          </div>
          <Card className="resultado-card">
            <Card.Header className="bg-white py-3">
              <h6 className="m-0 fw-bold text-muted text-uppercase">
                Ranking Completo: {campanhaAtual?.tipoCampanha.replace(/_/g, " ")}
              </h6>
            </Card.Header>
            <ListGroup variant="flush">
              {opcoes.map((op, index) => {
                const percentualBarra = maxVotos > 0 ? (op.totalVotos / maxVotos) * 100 : 0;
                
                return (
                  <ListGroup.Item key={op.id} className="resultado-list-item py-2 px-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ minWidth: '50px' }}>
                        <Trofeus posicao={index + 1} />
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                        <span className="fw-bold text-dark d-block">{op.nome}</span>
                      </div>
                      <div className="flex-grow-1 mx-3 d-none d-md-block">
                        <ProgressBar 
                          now={percentualBarra} 
                          variant={index === 0 ? "warning" : "success"} 
                          className="progress-custom" 
                        />
                      </div>
                      <div className="text-end" style={{ minWidth: '80px' }}>
                          <span className="text-pontos fw-bold d-block">{op.totalVotos} pts</span>
                          <small className="text-muted" style={{fontSize: '0.75rem'}}>
                              {getPercent(op.totalVotos)}%
                          </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        </>
      ) : (
        <div className="text-center py-5 text-muted bg-light rounded border border-dashed">
          <TrophyFill size={48} className="mb-3 text-secondary opacity-25" />
          <h5>Nenhum resultado para exibir</h5>
          <p>
            {campanhas.length > 0 
                ? "Selecione uma campanha acima para ver os dados." 
                : "Não há campanhas disponíveis para visualização no momento."}
          </p>
        </div>
      )}
    </Container>
  );
}

export default Resultados;