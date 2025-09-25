import axios from "axios";
import React, { useState, useEffect } from "react";
import { Form, Modal, Button, Spinner, ListGroup, InputGroup, Table, Badge, Card, Container, Alert } from "react-bootstrap";

// --- Interfaces de Tipos ---
interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  totalVotos?: number; // 👈 adicionado
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
}

// --- Constantes da API ---
const API_URL_CAMPANHAS = "http://localhost:8080/campanhas";
const API_URL_OPCOES = "http://localhost:8080/opcaoVoto";

// Interceptor para sempre mandar o token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Campanhas() {
  // --- Estados ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOpcoes, setIsLoadingOpcoes] = useState(false);

  const [isOpeningLoading, setIsOpeningLoading] = useState(false);
  const [isClosingLoading, setIsClosingLoading] = useState(false);

  const [isOpeningOpcoesLoading, setIsOpeningOpcoesLoading] = useState(false);
  const [isClosingOpcoesLoading, setIsClosingOpcoesLoading] = useState(false);

  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModalCampanha, setShowModalCampanha] = useState(false);
  const [isEditingId, setIsEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CampanhaRequest>({
    titulo: "", descricao: "", dataInicio: "", dataFim: "", ativo: true,
  });

  const [showModalOpcoes, setShowModalOpcoes] = useState(false);
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);
  const [opcoesVoto, setOpcoesVoto] = useState<OpcaoVoto[]>([]);
  const [newOpcaoNome, setNewOpcaoNome] = useState("");

  useEffect(() => {
    fetchCampanhas();
  }, []);

  // --- Funções de Modal de Campanhas ---
  const handleAbrirModalCriar = () => {
    setIsEditingId(null);
    setFormData({ titulo: "", descricao: "", dataInicio: "", dataFim: "", ativo: true });
    setIsOpeningLoading(true);
    setTimeout(() => {
      setShowModalCampanha(true);
      setIsOpeningLoading(false);
    }, 500);
  };

  const handleAbrirModalEditar = (campanha: Campanha) => {
    setIsEditingId(campanha.id);
    const formatarDataParaInput = (data: string) => new Date(data).toISOString().substring(0, 16);
    setFormData({
      titulo: campanha.titulo, descricao: campanha.descricao,
      dataInicio: formatarDataParaInput(campanha.dataInicio),
      dataFim: formatarDataParaInput(campanha.dataFim), ativo: campanha.ativo,
    });
    setIsOpeningLoading(true);
    setTimeout(() => {
      setShowModalCampanha(true);
      setIsOpeningLoading(false);
    }, 500);
  };

  const handleFecharModalCampanha = () => {
    setIsClosingLoading(true);
    setTimeout(() => {
      setShowModalCampanha(false);
      setIsEditingId(null);
      setIsClosingLoading(false);
    }, 500);
  };

  // --- API ---
  const fetchCampanhas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Campanha[]>(API_URL_CAMPANHAS);
      setCampanhas(response.data);
      setError(null);
    } catch (err) {
      setError("Não foi possível carregar as campanhas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarCampanha = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const requestData = {
      ...formData,
      dataInicio: new Date(formData.dataInicio).toISOString(),
      dataFim: new Date(formData.dataFim).toISOString(),
    };
    try {
      if (isEditingId) {
        await axios.put(`${API_URL_CAMPANHAS}/${isEditingId}`, requestData);
      } else {
        await axios.post(API_URL_CAMPANHAS, requestData);
      }
      handleFecharModalCampanha();
      fetchCampanhas();
    } catch (err) {
      setError("Erro ao salvar a campanha.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Modal de Opções ---
  const handleAbrirModalOpcoes = async (campanha: Campanha) => {
    setSelectedCampanha(campanha);
    setIsOpeningOpcoesLoading(true);
    setTimeout(async () => {
      setShowModalOpcoes(true);
      setIsOpeningOpcoesLoading(false);

      setIsLoadingOpcoes(true);
      try {
        const url = `${API_URL_OPCOES}/por-campanha/${campanha.id}`;
        const response = await axios.get<OpcaoVoto[]>(url);
        setOpcoesVoto(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
        alert("Não foi possível carregar as opções de voto.");
      } finally {
        setIsLoadingOpcoes(false);
      }
    }, 500);
  };

  const handleFecharModalOpcoes = () => {
    setIsClosingOpcoesLoading(true);
    setTimeout(() => {
      setShowModalOpcoes(false);
      setIsClosingOpcoesLoading(false);
    }, 500);
  };

  // --- Outras funções ---
  const handleExcluirCampanha = async (id: number) => { if (window.confirm("Tem certeza?")) { try { await axios.delete(`${API_URL_CAMPANHAS}/${id}`); fetchCampanhas(); } catch (err) { setError("Erro ao excluir."); } } };
  const handleAdicionarOpcao = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!newOpcaoNome.trim() || !selectedCampanha) return; try { const payload = { nome: newOpcaoNome, campanhaId: selectedCampanha.id }; const response = await axios.post<OpcaoVoto>(API_URL_OPCOES, payload); setOpcoesVoto(p => [...p, response.data]); setNewOpcaoNome(""); } catch (err) { console.error("Erro:", err); alert("Erro ao adicionar."); } };
  const handleExcluirOpcao = async (opcaoId: number) => { if (window.confirm("Tem certeza?")) { try { await axios.delete(`${API_URL_OPCOES}/${opcaoId}`); setOpcoesVoto(p => p.filter(op => op.id !== opcaoId)); } catch (err) { alert("Erro ao excluir."); } } };
  const handleChangeForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value, type } = event.target; const val = type === "checkbox" ? (event.target as HTMLInputElement).checked : value; setFormData(p => ({ ...p, [name]: val })); };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gerenciador de Campanhas</h1>
        <Button variant="primary" size="lg" onClick={handleAbrirModalCriar}>+ Nova Campanha</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-5"><Spinner /></div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Título</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Votos</th> {/* 👈 nova coluna */}
                  <th className="text-center">Opções de Voto</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr key={c.id}>
                    <td>{c.titulo}</td>
                    <td className="text-center">
                      <Badge bg={c.ativo ? 'success' : 'secondary'}>
                        {c.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="info">{c.totalVotos ?? 0}</Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleAbrirModalOpcoes(c)}
                      >
                        Gerenciar
                      </Button>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleAbrirModalEditar(c)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleExcluirCampanha(c.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Campanha */}
      <Modal show={showModalCampanha} onHide={handleFecharModalCampanha} centered>
        <Modal.Header closeButton><Modal.Title>{isEditingId ? "Editar" : "Cadastrar"}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSalvarCampanha}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Título</Form.Label><Form.Control type="text" name="titulo" value={formData.titulo} onChange={handleChangeForm} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} name="descricao" value={formData.descricao} onChange={handleChangeForm} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Início</Form.Label><Form.Control type="datetime-local" name="dataInicio" value={formData.dataInicio} onChange={handleChangeForm} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Fim</Form.Label><Form.Control type="datetime-local" name="dataFim" value={formData.dataFim} onChange={handleChangeForm} required /></Form.Group>
            <Form.Check type="switch" label="Ativa" name="ativo" checked={formData.ativo} onChange={handleChangeForm} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalCampanha} disabled={isSaving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? <><Spinner size="sm" /> Salvando...</> : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Opções */}
      <Modal show={showModalOpcoes} onHide={handleFecharModalOpcoes} centered>
        <Modal.Header closeButton><Modal.Title>Opções: {selectedCampanha?.titulo}</Modal.Title></Modal.Header>
        <Modal.Body>
          <h6>Adicionar Nova Opção</h6>
          <Form onSubmit={handleAdicionarOpcao}>
            <InputGroup className="mb-3">
              <Form.Control placeholder="Nome da opção" value={newOpcaoNome} onChange={(e) => setNewOpcaoNome(e.target.value)} required />
              <Button type="submit">Adicionar</Button>
            </InputGroup>
          </Form>
          <hr />
          <h6>Já Adicionado</h6>
          {isLoadingOpcoes ? (
            <div className="text-center"><Spinner /></div>
          ) : opcoesVoto.length > 0 ? (
            <ListGroup>
              {opcoesVoto.map((op) => (
                <ListGroup.Item key={op.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{op.nome}</strong>
                  </div>
                  <div>
                    <Badge bg="info" className="me-2">{op.totalVotos} votos</Badge>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleExcluirOpcao(op.id)}
                    >
                      X
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : <p className="text-muted">Nenhuma opção.</p>}
        </Modal.Body>
      </Modal>

      {/* Overlay Spinner Tela Cheia */}
      {(isClosingLoading || isOpeningLoading || isOpeningOpcoesLoading || isClosingOpcoesLoading) && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div className="bg-white p-4 rounded shadow-lg d-flex align-items-center gap-3">
            <Spinner animation="border" role="status" />
            <span style={{ fontSize: '1.2em' }}>Carregando...</span>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Campanhas;
