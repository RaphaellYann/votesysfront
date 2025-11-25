import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Modal,
  Form,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import "./index.css"; 


import {
  buscarTodosUsuarios,
  adminAtualizarUsuario,
  solicitarRecuperacaoSenha,
  type Usuario,
  type AdminUsuarioRequest, 
  type RecuperarSenhaRequest, 
} from "../../services/usuarioService";

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showModalUsuario, setShowModalUsuario] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<AdminUsuarioRequest, "senha">>({
    nome: "",
    email: "",
    cpf: "",
    role: "ROLE_USER",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState<number | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await buscarTodosUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(
        "Não foi possível carregar os usuários. Verifique sua autenticação."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const runWithOverlay = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setTimeout(() => setIsTransitioning(false), 300);
    }, 50);
  };

  const handleAbrirModalEditar = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      role: usuario.role,
    });
    runWithOverlay(() => setShowModalUsuario(true));
  };

  const handleFecharModalUsuario = () => {
    runWithOverlay(() => {
      setShowModalUsuario(false);
      setEditingId(null);
    });
  };

  const handleChangeForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload: Omit<AdminUsuarioRequest, "senha"> = { ...formData };

    try {
      if (editingId) {
        await adminAtualizarUsuario(editingId, payload);
      }
      handleFecharModalUsuario();
      fetchUsuarios();
    } catch (err) {
      setError("Erro ao salvar usuário. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnviarLinkReset = async (
    e: React.MouseEvent,
    usuario: Usuario
  ) => {
    e.stopPropagation(); 
    setIsSendingReset(usuario.id);
    setResetError(null);
    setResetSuccess(null);

    try {
      const request: RecuperarSenhaRequest = { email: usuario.email };
      await solicitarRecuperacaoSenha(request);
      setResetSuccess(`Link de redefinição enviado para ${usuario.email}.`);
    } catch (err) {
      console.error("Erro ao enviar link de reset:", err);
      setResetError("Falha ao enviar o link. Tente novamente.");
    } finally {
      setIsSendingReset(null);
    }
  };
  const formatarRole = (role: string) => {
    return (
      role
        .replace("ROLE_", "")
        .replace("_", " ")
        .charAt(0)
        .toUpperCase() +
      role.replace("ROLE_", "").replace("_", " ").slice(1).toLowerCase()
    );
  };

  return (
    <Container fluid="xl" className="mt-4">
      <div className="d-flex justify-content-between align-items-center page-header">
        <h4>Gerenciamento de Usuários</h4>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {resetError && (
        <Alert variant="danger" onClose={() => setResetError(null)} dismissible>
          {resetError}
        </Alert>
      )}

      {resetSuccess && (
        <Alert
          variant="success"
          onClose={() => setResetSuccess(null)}
          dismissible
        >
          {resetSuccess}
        </Alert>
      )}

      <Card className="campanha-card">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-2">Carregando usuários...</p>
            </div>
          ) : (
            <Table responsive hover className="campanha-table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CPF</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => handleAbrirModalEditar(u)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <span className="titulo-campanha">{u.nome}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.cpf}</td>
                      <td className="text-center">
                        <Badge
                          className={
                            u.role.includes("GERAL")
                              ? "badge-status badge-status-ativa" // Verde
                              : u.role.includes("NORMAL")
                              ? "badge-status badge-status-publica" // Azul
                              : "badge-status badge-status-inativa" // Cinza
                          }
                        >
                          {formatarRole(u.role)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-secondary"
                          className="btn-opcoes"
                          disabled={isSendingReset === u.id}
                          onClick={(e) => handleEnviarLinkReset(e, u)}
                        >
                          {isSendingReset === u.id ? (
                            <Spinner as="span" size="sm" />
                          ) : (
                            "Enviar Link Senha"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-3">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showModalUsuario}
        onHide={handleFecharModalUsuario}
        centered
        dialogClassName="modal-campanha"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarUsuario}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                name="nome"
                value={formData.nome}
                onChange={handleChangeForm}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChangeForm}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>CPF</Form.Label>
              <Form.Control
                name="cpf"
                value={formData.cpf}
                onChange={handleChangeForm}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChangeForm}
              >
                <option value="ROLE_USER">Usuário Comum</option>
                <option value="ROLE_ADMIN_NORMAL">Administrador Normal</option>
                <option value="ROLE_ADMIN_GERAL">Administrador Geral</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleFecharModalUsuario}
              disabled={isSaving}
              className="me-2"
            >
              Cancelar
            </Button>
            <Button
              className="btn-salvar-campanha"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* spinner */}
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

export default UsuariosAdmin;