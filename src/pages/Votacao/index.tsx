import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Spinner,
  Card,
  Button,
  Modal,
  Alert,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircleFill, CircleFill, BarChartLine, ArrowRight, CheckLg, ExclamationTriangleFill } from "react-bootstrap-icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import type { RootState } from "../../redux/store";
import {
  buscarTodasCampanhas,
  type Campanha, 
} from "../../services/campanhaService";
import {
  buscarOpcoesPorCampanha,
  type OpcaoVoto,
} from "../../services/opcaoVotoService";
import { enviarVoto as enviarVotoService } from "../../services/votoService";
import api from "../../services/api";
import Trofeus from "../../componentes/trofeus";

import "./index.css";

const reorder = (
  list: OpcaoVoto[],
  startIndex: number,
  endIndex: number
): OpcaoVoto[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function VotacaoPage() {
  const navigate = useNavigate();
  
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [opcoes, setOpcoes] = useState<OpcaoVoto[]>([]);
  
  // Estados de seleção
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);
  const [selectedOpcoes, setSelectedOpcoes] = useState<number[]>([]);
  
  // Estados de UI/Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { usuario } = useSelector((state: RootState) => state.auth);
  

  const isSuperAdmin = usuario?.role === "ROLE_ADMIN_GERAL";

  const runWithOverlay = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setTimeout(() => setIsTransitioning(false), 300);
    }, 50);
  };

  // --- CORREÇÃO AQUI ---
  const fetchCampanhas = useCallback(async () => {

    if (campanhas.length === 0) setIsLoading(true);
    
    setError(null);
    try {
      let data: Campanha[];
      
      if (usuario?.role === "ROLE_ADMIN_GERAL") {
        data = await buscarTodasCampanhas();
      } else {

        const response = await api.get<Campanha[]>("/campanhas/publicas");
        data = response.data;
      }

      
      const sorted = data.sort((a, b) => (a.ativo === b.ativo ? 0 : a.ativo ? -1 : 1));
      setCampanhas(sorted);

    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar a lista de campanhas.");
    } finally {
      setIsLoading(false);
    }
  }, [usuario?.role, campanhas.length]);

  useEffect(() => {
    fetchCampanhas();
  }, [fetchCampanhas]);

  const abrirModalVotacao = async (campanha: Campanha) => {
    runWithOverlay(async () => {
      setSelectedCampanha(campanha);
      setSelectedOpcoes([]);
      try {
        const responseData = await buscarOpcoesPorCampanha(campanha.id);
        setOpcoes(responseData);
        setShowModal(true);
      } catch {
        setError("Erro ao carregar opções de voto.");
      }
    });
  };

  const fecharModal = () => {
    runWithOverlay(() => {
      setShowModal(false);
      setShowSuccessModal(false);
      setSelectedCampanha(null);
      setOpcoes([]);
      setError(null);
    });
  };

  const irParaResultados = () => {
    fecharModal();
    navigate('/resultados');
  };

  const toggleOpcao = (id: number) => {
    if (!selectedCampanha) return;
    const tipo = selectedCampanha.tipoCampanha.toLowerCase();

    if (tipo.includes("unico")) {
      setSelectedOpcoes([id]);
    } else {
      if (selectedOpcoes.includes(id)) {
        setSelectedOpcoes(selectedOpcoes.filter((op) => op !== id));
      } else {
        setSelectedOpcoes([...selectedOpcoes, id]);
      }
    }
  };

  const enviarVoto = async () => {
    if (!selectedCampanha) return;
    setIsVoting(true);
    setError(null);
    
    try {
      let opcoesIds: number[];
      if (selectedCampanha.tipoCampanha.toLowerCase().includes("ranqueado")) {
        opcoesIds = opcoes.map((op) => op.id);
      } else {
        opcoesIds = selectedOpcoes;
      }

      await enviarVotoService({
        campanhaId: selectedCampanha.id,
        opcoesIds,
      });

      setSuccessMessage("Seu voto foi computado com sucesso!");
      setShowSuccessModal(true);
      setShowModal(false);

  
      await fetchCampanhas(); 

    } catch (err: any) {
      const message = err.response?.data || "";
      
      if (typeof message === "string" && (message.includes("já votou") || message.includes("duplicado"))) {
          alert("Nosso sistema identificou que seu voto já foi processado.");
          setShowModal(false);
          fetchCampanhas();
          return;
      }

      setError(message || "Erro ao registrar voto. Tente novamente.");
    } finally {
      setIsVoting(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    setOpcoes((currentOpcoes) =>
      reorder(currentOpcoes, result.source.index, result.destination.index)
    );
  };

  return (
    <Container fluid="xl" className="votacao-container">
      {isTransitioning && (
        <div className="overlay-spinner-container show">
          <div className="overlay-spinner-box">
            <Spinner animation="border" variant="success" />
            <span>Carregando...</span>
          </div>
        </div>
      )}

      <div className="header-section text-center mb-5">
        <h2 className="votacao-title">
          🗳️ Campanhas de Votação {isSuperAdmin && <small className="text-muted fs-6">(Modo Admin Geral)</small>}
        </h2>
        <p className="votacao-subtitle">
          Participe ativamente e faça sua escolha valer.
        </p>
      </div>

      {error && !showModal && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="shadow-sm">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-2">Sincronizando com o banco de dados...</p>
        </div>
      ) : campanhas.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhuma campanha disponível para votação no momento.
        </Alert>
      ) : (
        <div className="votacao-grid">
          {campanhas.map((camp) => {
            const jaVotou = camp.usuarioJaVotou; 
            
            return (
            <Card
              key={camp.id}
              className={`votacao-card ${(!camp.ativo || jaVotou) ? "disabled-card" : ""} ${jaVotou ? "voted-card" : ""}`}
              onClick={() => {
                  if (jaVotou) return;
                  if (camp.ativo) abrirModalVotacao(camp);
              }}
            >
              <Card.Body className="d-flex flex-column">

                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`status-dot ${camp.ativo ? "active" : "inactive"}`}>
                    <CircleFill size={10} />
                    <span>{camp.ativo ? "Em andamento" : "Encerrada"}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {jaVotou && (
                       <Badge bg="success" className="border d-flex align-items-center">
                          <CheckLg className="me-1"/> Votado
                       </Badge>
                    )}
                    <Badge bg="light" text="dark" className="type-badge border">
                      {camp.tipoCampanha.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <Card.Title className="mb-2">{camp.titulo}</Card.Title>

                <Card.Text className="text-muted flex-grow-1 description-text">
                  {camp.descricao}
                </Card.Text>

                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    {jaVotou 
                        ? "Obrigado pelo seu voto!" 
                        : camp.ativo 
                            ? "Disponível para voto" 
                            : "Votação encerrada"}
                  </span>
                  
                  <Button
                    variant={jaVotou ? "secondary" : camp.ativo ? "outline-success" : "secondary"}
                    size="sm"
                    className="px-3"
                    disabled={!camp.ativo || jaVotou}
                    style={{ 
                        opacity: jaVotou ? 0.8 : 1,
                        cursor: jaVotou ? "not-allowed" : "pointer"
                    }}
                  >
                    {jaVotou 
                        ? <> <CheckLg className="me-1"/> Votado </> 
                        : camp.ativo 
                            ? <> Votar Agora <ArrowRight className="ms-1" /> </>
                            : "Fechada"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )})}
        </div>
      )}

      {/* --- MODAL DE VOTAÇÃO --- */}
      <Modal
        show={showModal}
        onHide={fecharModal}
        centered
        size="lg"
        dialogClassName="votacao-modal"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title>{selectedCampanha?.titulo}</Modal.Title>
            <p className="text-muted small mb-0 mt-1">
              {selectedCampanha?.descricao}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
               <ExclamationTriangleFill className="me-2"/> {error}
            </Alert>
          )}

          <div className="instruction-box mb-4">
            {selectedCampanha &&
              (selectedCampanha.tipoCampanha.toLowerCase().includes("unico")
                ? "🎯 Selecione apenas uma opção abaixo:"
                : selectedCampanha.tipoCampanha.toLowerCase().includes("ranqueado")
                  ? "🔃 Arraste os itens para definir sua ordem de preferência:"
                  : "☑️ Você pode selecionar múltiplas opções:")}
          </div>

          {selectedCampanha &&
            selectedCampanha.tipoCampanha.toLowerCase().includes("ranqueado") ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="opcoes">
                {(provided) => (
                  <div
                    className="opcoes-grid ranking-mode"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {opcoes.map((op, index) => (
                      <Draggable
                        key={op.id.toString()}
                        draggableId={op.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`rankeado-wrapper ${snapshot.isDragging ? "dragging" : ""}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Trofeus posicao={index + 1} />
                            <div className="rankeado-card shadow-sm">
                              <span className="opcao-nome">{op.nome}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="opcoes-grid">
              {opcoes.map((op) => (
                <div
                  key={op.id}
                  className={`opcao-card ${selectedOpcoes.includes(op.id) ? "selected" : ""}`}
                  onClick={() => toggleOpcao(op.id)}
                >
                  <div className="check-indicator">
                    {selectedOpcoes.includes(op.id) && <CheckCircleFill />}
                  </div>
                  <span className="opcao-nome">{op.nome}</span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="link" className="text-muted text-decoration-none" onClick={fecharModal}>
            Cancelar
          </Button>

          <Button
            className="btn-votar px-4"
            onClick={enviarVoto}
            disabled={
              isVoting ||
              (!selectedCampanha?.tipoCampanha.toLowerCase().includes("ranqueado") &&
                selectedOpcoes.length === 0)
            }
          >
            {isVoting ? (
              <>
                <Spinner as="span" size="sm" role="status" aria-hidden="true" />
                {" Confirmando..."}
              </>
            ) : (
              "Confirmar Voto"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL DE SUCESSO --- */}
      <Modal
        show={showSuccessModal}
        onHide={fecharModal}
        centered
        size="md"
        dialogClassName="modal-success"
      >
        <Modal.Body className="text-center py-4">
          <div className="success-icon mb-3">
            <CheckCircleFill size={60} />
          </div>
          <h4 className="mb-2 fw-bold text-dark">Sucesso!</h4>
          <p className="text-muted mb-4">{successMessage}</p>

          <div className="d-grid gap-2">
            <Button
              variant="outline-success"
              onClick={irParaResultados}
              className="d-flex align-items-center justify-content-center py-2 fw-bold"
            >
              <BarChartLine className="me-2" />
              Ver Resultados Parciais
            </Button>

            <Button
              variant="link"
              onClick={fecharModal}
              className="text-muted text-decoration-none mt-1"
            >
              Voltar para campanhas
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default VotacaoPage;