import { useState, useEffect, useCallback } from "react";
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
  Row,
  Col,
} from "react-bootstrap";
import "./index.css"; 
import {
  ExclamationTriangleFill,
  PlusLg,
  TrophyFill,
  Trash,
} from "react-bootstrap-icons";

// Services
import {
  buscarTodasCampanhas,
  criarCampanha,
  atualizarCampanha,
  excluirCampanha,
  type Campanha,
} from "../../services/campanhaService";

import {
  buscarOpcoesPorCampanha,
  adicionarOpcao,
  excluirOpcao,
  type OpcaoVoto,
} from "../../services/opcaoVotoService";

// Interface local para o Formulário (Igual ao LoginRequest do professor)
interface CampanhaFormData {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  tipoCampanha: string;
}

// Funções auxiliares
const formatarDataParaInput = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

const formatarDataParaAPI = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 19);
};

function Campanhas() {
  // Estados de dados
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [opcoesVoto, setOpcoesVoto] = useState<OpcaoVoto[]>([]);
  
  // Estado do Formulário (Seguindo padrão do Login)
  const [formData, setFormData] = useState<CampanhaFormData>({
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    ativo: true,
    tipoCampanha: "VOTO_UNICO",
  });

  // UI States
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Modais
  const [showModalCampanha, setShowModalCampanha] = useState(false);
  const [showModalOpcoes, setShowModalOpcoes] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  
  // Edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);
  const [newOpcaoNome, setNewOpcaoNome] = useState("");
  
  // Ações async
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingOpcoes, setIsLoadingOpcoes] = useState(false);

  const fetchCampanhas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await buscarTodasCampanhas();
      setCampanhas(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as campanhas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampanhas();
  }, [fetchCampanhas]);

  const runWithOverlay = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setTimeout(() => setIsTransitioning(false), 300);
    }, 50);
  };

  const handleAbrirModalCriar = () => {
    setEditingId(null);
    // Limpa o form manualmente
    setFormData({
      titulo: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      ativo: true,
      tipoCampanha: "VOTO_UNICO",
    });
    runWithOverlay(() => setShowModalCampanha(true));
  };

  const handleAbrirModalEditar = (campanha: Campanha) => {
    setEditingId(campanha.id);
    // Preenche o formData com os dados da campanha (Aqui estava o erro antes, agora está mapeado direto)
    setFormData({
      titulo: campanha.titulo,
      descricao: campanha.descricao,
      dataInicio: formatarDataParaInput(campanha.dataInicio),
      dataFim: formatarDataParaInput(campanha.dataFim),
      ativo: campanha.ativo,
      tipoCampanha: campanha.tipoCampanha,
    });
    runWithOverlay(() => setShowModalCampanha(true));
  };

  const handleFecharModalCampanha = () => {
    runWithOverlay(() => {
      setShowModalCampanha(false);
      setEditingId(null);
      setError(null);
    });
  };

  // handleChange genérico igual ao do professor
  const handleChangeForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Lógica para checkbox (switch) vs outros inputs
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSalvarCampanha = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Prepara o objeto para envio (Payload)
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        ativo: formData.ativo,
        tipoCampanha: formData.tipoCampanha,
        // Conversão de data para formato Java
        dataInicio: formatarDataParaAPI(formData.dataInicio),
        dataFim: formatarDataParaAPI(formData.dataFim),
        votacaoAnonima: false // Valor padrão fixo
      };

      if (editingId) {
        await atualizarCampanha(editingId, payload);
      } else {
        await criarCampanha(payload);
      }
      
      handleFecharModalCampanha();
      fetchCampanhas();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar a campanha. Verifique os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExcluirCampanhaClick = () => {
    if (editingId) {
      const campanhaAtual = campanhas.find((c) => c.id === editingId);
      if (campanhaAtual && (campanhaAtual.totalVotos || 0) > 0) {
        setError("Não é possível excluir uma campanha que já possui votos registrados.");
        setShowModalCampanha(false); 
        return;
      }
      setShowConfirmDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingId) return;
    setIsDeleting(true);
    try {
      await excluirCampanha(editingId);
      setShowConfirmDeleteModal(false);
      handleFecharModalCampanha();
      fetchCampanhas();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir a campanha.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAbrirModalOpcoes = async (e: React.MouseEvent, campanha: Campanha) => {
    e.stopPropagation();
    setSelectedCampanha(campanha);
    setIsLoadingOpcoes(true);
    setShowModalOpcoes(true);
    
    try {
      const data = await buscarOpcoesPorCampanha(campanha.id);
      const ordenado = Array.isArray(data) 
        ? data.sort((a, b) => b.totalVotos - a.totalVotos) 
        : [];
      setOpcoesVoto(ordenado);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOpcoes(false);
    }
  };

  const handleAdicionarOpcao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpcaoNome.trim() || !selectedCampanha) return;

    try {
      const nova = await adicionarOpcao({ 
        nome: newOpcaoNome, 
        campanhaId: selectedCampanha.id 
      });
      setOpcoesVoto((prev) => [...prev, nova].sort((a, b) => b.totalVotos - a.totalVotos));
      setNewOpcaoNome("");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar a opção.");
    }
  };

  const handleExcluirOpcaoClick = async (id: number) => {
    try {
      await excluirOpcao(id);
      setOpcoesVoto((prev) => prev.filter((op) => op.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir a opção. Verifique se ela já possui votos.");
    }
  };

  const getVotosEdicao = () => {
    if (!editingId) return 0;
    const c = campanhas.find((x) => x.id === editingId);
    return c?.totalVotos || 0;
  };

  return (
    <Container fluid="xl" className="mt-4">
      <div className="d-flex justify-content-between align-items-center page-header">
        <h4>Gerenciador de Campanhas</h4>
        <Button className="btn-nova-campanha" onClick={handleAbrirModalCriar}>
          <PlusLg size={16} className="me-2" /> Nova Campanha
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <ExclamationTriangleFill className="me-2" /> {error}
        </Alert>
      )}

      <Card className="campanha-card">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-2">Carregando campanhas...</p>
            </div>
          ) : (
            <Table responsive hover className="campanha-table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Título</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Total Acumulado</th>
                  <th className="text-center pe-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleAbrirModalEditar(c)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="ps-3">
                      <span className="titulo-campanha">{c.titulo}</span>
                    </td>
                    <td className="text-center text-muted">
                      {c.tipoCampanha.replace(/_/g, " ")}
                    </td>
                    <td className="text-center">
                      <Badge
                        className={
                          c.ativo
                            ? "badge-status badge-status-ativa"
                            : "badge-status badge-status-inativa"
                        }
                      >
                        {c.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge className="badge-status badge-status-votos">
                        <TrophyFill size={12} className="me-1 text-warning"/>
                        {c.totalVotos ?? 0} pts
                      </Badge>
                    </td>
                    <td className="text-center pe-3">
                      <Button
                        variant="outline-secondary"
                        className="btn-opcoes btn-sm"
                        onClick={(e) => handleAbrirModalOpcoes(e, c)}
                      >
                        Opções / Placar
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
      <Modal
        show={showModalCampanha}
        onHide={handleFecharModalCampanha}
        centered
        size="lg"
        dialogClassName="modal-campanha"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Campanha" : "Nova Campanha"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarCampanha}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChangeForm}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descricao"
                value={formData.descricao}
                onChange={handleChangeForm}
                required
              />
            </Form.Group>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Campanha</Form.Label>
                  <Form.Select
                    name="tipoCampanha"
                    value={formData.tipoCampanha}
                    onChange={handleChangeForm}
                    disabled={!!editingId}
                    required
                  >
                    <option value="VOTO_UNICO">Voto Único</option>
                    <option value="VOTOS_MULTIPLOS">Votos Múltiplos</option>
                    <option value="SELECAO_MULTIPLA">Seleção Múltipla</option>
                    <option value="RANQUEADO">Ranqueado (Ranking)</option>
                  </Form.Select>
                  {editingId && <Form.Text className="text-muted">O tipo não pode ser alterado após a criação.</Form.Text>}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleChangeForm}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Fim</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleChangeForm}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="switch"
              label="Marcar como Ativa"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChangeForm}
              className="mb-2"
            />
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex w-100 justify-content-between align-items-center">
              <div>
                {editingId && getVotosEdicao() === 0 && (
                  <Button
                    type="button"
                    className="btn-excluir-campanha d-flex align-items-center p-0"
                    onClick={handleExcluirCampanhaClick}
                  >
                    <Trash size={16} className="me-1"/> Excluir
                  </Button>
                )}
              </div>
              <div>
                <Button variant="secondary" onClick={handleFecharModalCampanha} disabled={isSaving} className="me-2">
                  Cancelar
                </Button>
                <Button type="submit" className="btn-salvar-campanha" disabled={isSaving}>
                  {isSaving ? <Spinner as="span" size="sm" role="status" aria-hidden="true" /> : "Salvar Campanha"}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Opções */}
      <Modal show={showModalOpcoes} onHide={() => setShowModalOpcoes(false)} centered dialogClassName="modal-opcoes">
        <Modal.Header closeButton>
          <Modal.Title>Opções: {selectedCampanha?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="form-label">Adicionar Nova Opção</h6>
          <Form onSubmit={handleAdicionarOpcao}>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Nome da opção"
                value={newOpcaoNome}
                onChange={(e) => setNewOpcaoNome(e.target.value)}
                required
              />
              <Button type="submit" className="btn-adicionar d-flex align-items-center">
                <PlusLg className="me-1"/> Adicionar
              </Button>
            </InputGroup>
          </Form>
          <hr />
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="form-label mb-0">Placar / Ranking Atual</h6>
            {opcoesVoto.length > 0 && <small className="text-muted">Ordenado por pontos</small>}
          </div>

          {isLoadingOpcoes ? (
            <div className="text-center p-3"><Spinner variant="success" /></div>
          ) : opcoesVoto.length > 0 ? (
            <ListGroup variant="flush">
              {opcoesVoto.map((op, index) => (
                <ListGroup.Item key={op.id} className="d-flex justify-content-between align-items-center px-0 py-2">
                  <div className="d-flex align-items-center">
                    <Badge 
                        bg={index < 3 ? "warning" : "light"} 
                        text={index < 3 ? "dark" : "secondary"} 
                        pill 
                        className="me-2"
                    >
                        {index + 1}º
                    </Badge>
                    <span className="fw-medium">{op.nome}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Badge bg="primary" className="me-3">{op.totalVotos} pts</Badge>
                    {op.totalVotos === 0 && (
                      <Button 
                        variant="link" 
                        className="btn-excluir-opcao text-danger p-0" 
                        onClick={() => handleExcluirOpcaoClick(op.id)}
                        title="Excluir opção"
                      >
                        <Trash size={18} />
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted text-center small mt-3">Nenhuma opção cadastrada.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        show={showConfirmDeleteModal}
        onHide={() => setShowConfirmDeleteModal(false)}
        centered
        size="sm"
        dialogClassName="modal-confirm-delete"
      >
        <Modal.Body>
          <div className="icon-danger text-center">
            <ExclamationTriangleFill size={40} className="text-danger mb-3" />
          </div>
          <h5 className="text-center">Excluir Campanha?</h5>
          <p className="text-muted text-center">
            Esta ação não pode ser desfeita. Todos os dados e votos associados serão perdidos.
          </p>
          <div className="d-grid gap-2">
             <Button className="btn-confirm-delete" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? <><Spinner as="span" size="sm" role="status" aria-hidden="true"/> Excluindo...</> : "Sim, excluir campanha"}
             </Button>
             <Button variant="outline-secondary" onClick={() => setShowConfirmDeleteModal(false)} disabled={isDeleting}>
                Cancelar
             </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Overlay de transição */}
      {isTransitioning && (
        <div className="overlay-spinner-container show">
          <div className="overlay-spinner-box">
            <Spinner animation="border" role="status" variant="success" />
            <span>Carregando...</span>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Campanhas;