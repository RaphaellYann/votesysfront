import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Spinner,
  Card,
  Button,
  Modal,
  Alert,
  Badge,
} from "react-bootstrap";
import "./index.css";

interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  tipoCampanha: string;
  votacaoAnonima: boolean;
  ativo: boolean;
}

interface OpcaoVoto {
  id: number;
  nome: string;
  totalVotos: number;
}

const API_BASE = "http://localhost:8080";
const API_CAMPANHAS = `${API_BASE}/campanhas`;
const API_OPCOES = `${API_BASE}/opcaoVoto`;
const API_VOTOS = `${API_BASE}/votos`;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function VotacaoPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [opcoes, setOpcoes] = useState<OpcaoVoto[]>([]);
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);
  const [selectedOpcoes, setSelectedOpcoes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchCampanhas = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_CAMPANHAS);
        const campanhasAtivas = response.data.filter((c: Campanha) => c.ativo);
        setCampanhas(campanhasAtivas);
      } catch {
        setError("Erro ao carregar campanhas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampanhas();
  }, []);

  const abrirModalVotacao = async (campanha: Campanha) => {
    setSelectedCampanha(campanha);
    setSelectedOpcoes([]);
    try {
      const response = await axios.get(`${API_OPCOES}/por-campanha/${campanha.id}`);
      setOpcoes(response.data);
      setShowModal(true);
    } catch {
      setError("Erro ao carregar opções de voto.");
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedCampanha(null);
    setOpcoes([]);
  };

  // ✅ Agora respeita se é voto único ou múltiplo
  const toggleOpcao = (id: number) => {
    if (!selectedCampanha) return;

    const tipo = selectedCampanha.tipoCampanha.toLowerCase();

    if (tipo.includes("unico")) {
      // apenas uma opção permitida
      setSelectedOpcoes([id]);
    } else {
      // múltiplas opções permitidas
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
      await axios.post(API_VOTOS, {
        campanhaId: selectedCampanha.id,
        opcoesIds: selectedOpcoes,
      });
      alert("✅ Voto registrado com sucesso!");
      fecharModal();
    } catch {
      setError("Erro ao registrar o voto.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Container className="votacao-container">
      <h2 className="votacao-title">🗳️ Campanhas de Votação</h2>
      <p className="votacao-subtitle">Escolha uma campanha ativa e participe da votação!</p>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="shadow-sm">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="votacao-grid">
          {campanhas.map((camp) => (
            <Card
              key={camp.id}
              className="votacao-card"
              onClick={() => abrirModalVotacao(camp)}
            >
              <Card.Body>
                <Card.Title className="fw-bold">{camp.titulo}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {camp.tipoCampanha.replace("_", " ")}
                </Card.Subtitle>
                <Card.Text className="text-secondary small">{camp.descricao}</Card.Text>
                <Badge bg={camp.votacaoAnonima ? "info" : "secondary"} className="rounded-pill">
                  {camp.votacaoAnonima ? "Pública" : "Privada"}
                </Badge>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* 🌟 NOVO MODAL MODERNO */}
      <Modal show={showModal} onHide={fecharModal} centered size="lg" className="votacao-modal">
        <div className="modal-content-modern">
          <div className="modal-header-modern">
            <h4>{selectedCampanha?.titulo}</h4>
            <button className="close-btn" onClick={fecharModal}>
              ✕
            </button>
          </div>

          <div className="modal-body-modern">
            <p className="descricao">{selectedCampanha?.descricao}</p>

            {selectedCampanha && (
              <p className="text-center tipo-text">
                {selectedCampanha.tipoCampanha.toLowerCase().includes("unico")
                  ? "🔸 Escolha apenas uma opção"
                  : "🔹 Você pode escolher várias opções"}
              </p>
            )}

            <div className="opcoes-grid">
              {opcoes.map((op) => (
                <div
                  key={op.id}
                  className={`opcao-card ${selectedOpcoes.includes(op.id) ? "selected" : ""}`}
                  onClick={() => toggleOpcao(op.id)}
                >
                  <span className="opcao-nome">{op.nome}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer-modern">
            <Button variant="outline-secondary" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button
              className="btn-votar"
              onClick={enviarVoto}
              disabled={selectedOpcoes.length === 0 || isVoting}
            >
              {isVoting ? <Spinner size="sm" /> : "Confirmar Voto"}
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}

export default VotacaoPage;
