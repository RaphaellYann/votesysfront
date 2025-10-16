import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Modal,
  Button,
  Spinner,
  ListGroup,
  InputGroup,
  Table,
  Badge,
  Card,
  Container,
  Alert,
} from "react-bootstrap";
import "./index.css";

// --- Type Interfaces ---
interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  votacaoAnonima: boolean;
  tipoCampanha: string;
  totalVotos?: number;
}

interface OpcaoVoto {
  id: number;
  nome: string;
  totalVotos: number;
}

interface CampanhaRequest {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  votacaoAnonima: boolean;
  tipoCampanha: string;
}

// --- API Constants ---
const API_BASE_URL = "http://localhost:8080";
const API_URL_CAMPANHAS = `${API_BASE_URL}/campanhas`;
const API_URL_OPCOES = `${API_BASE_URL}/opcaoVoto`;

// --- Axios Interceptor ---
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Helper Functions ---
const formatarDataParaInput = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "";
    }
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

const initialFormData: CampanhaRequest = {
  titulo: "",
  descricao: "",
  dataInicio: "",
  dataFim: "",
  ativo: true,
  votacaoAnonima: true,
  tipoCampanha: "VOTO_UNICO",
};

function Campanhas() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [opcoesVoto, setOpcoesVoto] = useState<OpcaoVoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showModalCampanha, setShowModalCampanha] = useState(false);
  const [showModalOpcoes, setShowModalOpcoes] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOpcoes, setIsLoadingOpcoes] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState<CampanhaRequest>(initialFormData);
  const [newOpcaoNome, setNewOpcaoNome] = useState("");

  const fetchCampanhas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Campanha[]>(API_URL_CAMPANHAS);
      setCampanhas(response.data);
    } catch (err) {
      setError("Não foi possível carregar as campanhas.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampanhas();
  }, [fetchCampanhas]);

  const handleAbrirModalCriar = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsTransitioning(true);
    setTimeout(() => {
      setShowModalCampanha(true);
      setIsTransitioning(false);
    }, 500);
  };

  const handleAbrirModalEditar = (campanha: Campanha) => {
    setEditingId(campanha.id);
    setFormData({
      titulo: campanha.titulo,
      descricao: campanha.descricao,
      dataInicio: formatarDataParaInput(campanha.dataInicio),
      dataFim: formatarDataParaInput(campanha.dataFim),
      ativo: campanha.ativo,
      votacaoAnonima: campanha.votacaoAnonima,
      tipoCampanha: campanha.tipoCampanha,
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setShowModalCampanha(true);
      setIsTransitioning(false);
    }, 500);
  };
  
  const handleFecharModalCampanha = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        setShowModalCampanha(false);
        setEditingId(null);
        setIsTransitioning(false);
    }, 500);
  };

  const handleSalvarCampanha = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    
    const requestData = {
        ...formData,
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: new Date(formData.dataFim).toISOString(),
    };

    try {
        if (editingId) {
            await axios.put(`${API_URL_CAMPANHAS}/${editingId}`, requestData);
        } else {
            await axios.post(API_URL_CAMPANHAS, requestData);
        }
        handleFecharModalCampanha();
        fetchCampanhas();
    } catch (err) {
        setError("Erro ao salvar a campanha.");
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleExcluirCampanha = async () => {
    if (editingId && window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      setError(null);
      try {
        await axios.delete(`${API_URL_CAMPANHAS}/${editingId}`);
        handleFecharModalCampanha();
        fetchCampanhas();
      } catch (err) {
        setError("Erro ao excluir a campanha.");
        console.error(err);
      }
    }
  };

  const handleAbrirModalOpcoes = async (event: React.MouseEvent, campanha: Campanha) => {
    event.stopPropagation(); // Impede que o clique no botão abra o modal de edição
    setSelectedCampanha(campanha);
    setIsTransitioning(true);
    try {
      const url = `${API_URL_OPCOES}/por-campanha/${campanha.id}`;
      const response = await axios.get<OpcaoVoto[]>(url);
      setOpcoesVoto(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Não foi possível carregar as opções de voto.");
    } finally {
        setTimeout(() => {
            setShowModalOpcoes(true);
            setIsTransitioning(false);
        }, 500);
    }
  };

  const handleFecharModalOpcoes = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        setShowModalOpcoes(false);
        setSelectedCampanha(null);
        setIsTransitioning(false);
    }, 500);
  };

  const handleAdicionarOpcao = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newOpcaoNome.trim() || !selectedCampanha) return;
    try {
      const payload = { nome: newOpcaoNome, campanhaId: selectedCampanha.id };
      const response = await axios.post<OpcaoVoto>(API_URL_OPCOES, payload);
      setOpcoesVoto((prev) => [...prev, response.data]);
      setNewOpcaoNome("");
    } catch {
      setError("Erro ao adicionar a opção.");
    }
  };

  const handleExcluirOpcao = async (opcaoId: number) => {
    if (window.confirm("Excluir esta opção?")) {
      try {
        await axios.delete(`${API_URL_OPCOES}/${opcaoId}`);
        setOpcoesVoto((prev) => prev.filter((op) => op.id !== opcaoId));
      } catch {
        setError("Erro ao excluir a opção.");
      }
    }
  };

  const handleChangeForm = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const val = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Gerenciador de Campanhas</h4>
        <Button variant="primary" size="lg" onClick={handleAbrirModalCriar}>
          + Nova Campanha
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner />
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Título</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Acesso</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Votos</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr key={c.id} onClick={() => handleAbrirModalEditar(c)} style={{ cursor: 'pointer' }}>
                    <td>{c.titulo}</td>
                    <td className="text-center">{c.tipoCampanha.replace(/_/g, " ")}</td>
                    <td className="text-center">
                      <Badge bg={c.votacaoAnonima ? "info" : "secondary"}>
                        {c.votacaoAnonima ? "Pública" : "Privada"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg={c.ativo ? "success" : "secondary"}>
                        {c.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="info">{c.totalVotos ?? 0}</Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-secondary" size="sm" onClick={(e) => handleAbrirModalOpcoes(e, c)}>
                        Opções de Voto
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Campanha (Criar/Editar) */}
      <Modal show={showModalCampanha} onHide={handleFecharModalCampanha} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Editar Campanha" : "Cadastrar Campanha"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarCampanha}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" name="titulo" value={formData.titulo} onChange={handleChangeForm} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={3} name="descricao" value={formData.descricao} onChange={handleChangeForm} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Campanha</Form.Label>
              <Form.Select name="tipoCampanha" value={formData.tipoCampanha} onChange={handleChangeForm} required>
                <option value="VOTO_UNICO">Voto Único</option>
                <option value="VOTOS_MULTIPLOS">Votos Múltiplos</option>
                <option value="SELECAO_MULTIPLA">Seleção Múltipla</option>
                <option value="RANQUEADO">Ranqueado</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="switch" label="Campanha Pública (votação anônima)" name="votacaoAnonima" checked={formData.votacaoAnonima} onChange={handleChangeForm} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data de Início</Form.Label>
              <Form.Control type="datetime-local" name="dataInicio" value={formData.dataInicio} onChange={handleChangeForm} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data de Fim</Form.Label>
              <Form.Control type="datetime-local" name="dataFim" value={formData.dataFim} onChange={handleChangeForm} required />
            </Form.Group>
            <Form.Check type="switch" label="Ativa" name="ativo" checked={formData.ativo} onChange={handleChangeForm} />
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <div>
              {editingId && (
                <Button variant="danger" onClick={handleExcluirCampanha}>
                  Excluir
                </Button>
              )}
            </div>
            <div>
              <Button variant="secondary" onClick={handleFecharModalCampanha} disabled={isSaving} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? (<><Spinner size="sm" /> Salvando...</>) : "Salvar"}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Opções */}
      <Modal show={showModalOpcoes} onHide={handleFecharModalOpcoes} centered>
        <Modal.Header closeButton>
          <Modal.Title>Opções: {selectedCampanha?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Adicionar Nova Opção</h6>
          <Form onSubmit={handleAdicionarOpcao}>
            <InputGroup className="mb-3">
              <Form.Control placeholder="Nome da opção" value={newOpcaoNome} onChange={(e) => setNewOpcaoNome(e.target.value)} required />
              <Button type="submit">Adicionar</Button>
            </InputGroup>
          </Form>
          <hr />
          <h6>Opções Existentes</h6>
          {isLoadingOpcoes ? (
            <div className="text-center"><Spinner /></div>
          ) : opcoesVoto.length > 0 ? (
            <ListGroup>
              {opcoesVoto.map((op) => (
                <ListGroup.Item key={op.id} className="d-flex justify-content-between align-items-center">
                  <span>{op.nome}</span>
                  <div>
                    <Badge bg="info" className="me-2">{op.totalVotos} votos</Badge>
                    {op.totalVotos === 0 && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleExcluirOpcao(op.id)}>X</Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">Nenhuma opção cadastrada.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Overlay Spinner */}
      {isTransitioning && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 9999,
        }}>
          <div className="bg-white p-4 rounded shadow-lg d-flex align-items-center gap-3">
            <Spinner animation="border" role="status" />
            <span style={{ fontSize: "1.2em" }}>Carregando...</span>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Campanhas;

