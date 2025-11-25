import React, { useState, useEffect, FormEvent } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal, Tabs, Tab } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { ClockHistory, PersonBadge, ShieldLock } from "react-bootstrap-icons";

// --- IMPORTANTE: Verifique se estes caminhos estão corretos no seu projeto ---
import { type RootState, type AppDispatch } from "../../redux/store";
import { updateUsuario } from "../../redux/authSlice";
import {
  alterarPropriaSenha,
  atualizarProprioUsuario,
  type UsuarioRequestDTO,
} from "../../services/usuarioService";

import "./index.css";

// Interfaces Locais
interface DadosFormState { nome: string; email: string; cpf: string; }
interface SenhaFormState { senhaAtual: string; novaSenha: string; confirmarNovaSenha: string; }

const PerfilUsuario: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  
  // Pegando dados do Redux
  // @ts-ignore
  const { usuario, dataLogin, historicoNavegacao, ultimasVotacoes } = useSelector((state: RootState) => state.auth);

  // States
  const [showModalSenha, setShowModalSenha] = useState(false);
  const [dadosForm, setDadosForm] = useState<DadosFormState>({ nome: "", email: "", cpf: "", });
  
  // Loading e Erros - Dados Pessoais
  const [isSavingDados, setIsSavingDados] = useState(false);
  const [dadosError, setDadosError] = useState<string | null>(null);
  const [dadosSuccess, setDadosSuccess] = useState<string | null>(null);

  // Loading e Erros - Senha
  const [senhaForm, setSenhaForm] = useState<SenhaFormState>({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "", });
  const [isSavingSenha, setIsSavingSenha] = useState(false);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [senhaSuccess, setSenhaSuccess] = useState<string | null>(null);

  // Preenche o formulário ao carregar o usuário
  useEffect(() => {
    if (usuario) {
      setDadosForm({
        nome: usuario.nome || "",
        email: usuario.email || "",
        cpf: usuario.cpf || "",
      });
    }
  }, [usuario]);

  // --- HANDLERS ---
  const handleDadosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSenhaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFecharModalSenha = () => {
    setShowModalSenha(false);
    setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
    setSenhaError(null);
    setSenhaSuccess(null);
  };

  const handleAbrirModalSenha = () => {
    setSenhaError(null);
    setSenhaSuccess(null);
    setShowModalSenha(true);
  };

  // --- SALVAR DADOS PESSOAIS ---
  const handleDadosSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setIsSavingDados(true); 
    setDadosError(null); 
    setDadosSuccess(null);

    try {
      const dadosParaEnviar: UsuarioRequestDTO = { 
        ...dadosForm, 
        id: usuario.id!, 
        role: usuario.role!, 
        senha: null 
      };
      
      const usuarioAtualizado = await atualizarProprioUsuario(usuario.id, dadosParaEnviar);
      dispatch(updateUsuario(usuarioAtualizado));
      setDadosSuccess("Dados atualizados com sucesso!");
    } catch (err: any) {
      console.error("Erro ao salvar dados:", err);
      setDadosError(err.response?.data || "Erro ao atualizar dados.");
    } finally { 
      setIsSavingDados(false); 
    }
  };

  // --- ALTERAR SENHA (CORRIGIDO) ---
  const handleSenhaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!usuario || !usuario.email) {
        setSenhaError("Erro: E-mail do usuário não identificado. Faça login novamente.");
        return;
    }

    if (senhaForm.novaSenha !== senhaForm.confirmarNovaSenha) { 
        setSenhaError("As novas senhas não coincidem."); 
        return; 
    }

    setSenhaError(null); 
    setSenhaSuccess(null);
    setIsSavingSenha(true);

    try {
      console.log("Enviando solicitação de troca de senha...");
      
      await alterarPropriaSenha({ 
          email: usuario.email, 
          senhaAtual: senhaForm.senhaAtual, 
          novaSenha: senhaForm.novaSenha 
      });

      setSenhaSuccess("Senha alterada com sucesso!");
      
      setTimeout(() => { 
          handleFecharModalSenha(); 
      }, 2000);

    } catch (err: any) {
      console.error("Erro detalhado:", err);
      
      // Lógica robusta para pegar a mensagem de erro real do Java/Spring
      let mensagemErro = "Erro desconhecido ao tentar alterar a senha.";

      if (err.response) {
          // Se o backend devolveu uma String direta
          if (typeof err.response.data === 'string') {
              mensagemErro = err.response.data;
          } 
          // Se o backend devolveu um JSON (ex: erro de validação ou 500)
          else if (typeof err.response.data === 'object') {
              mensagemErro = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
          }
      } else if (err.message) {
          mensagemErro = err.message;
      }

      setSenhaError(mensagemErro);
    } finally { 
      setIsSavingSenha(false); 
    }
  };

  // Se o usuário não estiver carregado, mostra loading
  if (!usuario) {
      return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Spinner animation="border" variant="primary" />
        </Container>
      );
  }

  return (
    <Container fluid="xl" className="mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Meu Perfil</h2>
        <p className="text-muted">Gerencie seus dados pessoais e visualize sua atividade.</p>
      </div>

      <Card className="shadow-sm border-0 profile-tabs-card">
        <Card.Body className="p-0">
          <Tabs defaultActiveKey="dados" id="profile-tabs" className="custom-tabs px-3 pt-3">
            
            {/* ABA DADOS */}
            <Tab eventKey="dados" title={<><PersonBadge className="me-2"/>Meus Dados</>}>
              <div className="p-4">
                <Form onSubmit={handleDadosSubmit}>
                    {dadosError && <Alert variant="danger" dismissible onClose={() => setDadosError(null)}>{dadosError}</Alert>}
                    {dadosSuccess && <Alert variant="success" dismissible onClose={() => setDadosSuccess(null)}>{dadosSuccess}</Alert>}
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome Completo</Form.Label>
                                <Form.Control type="text" name="nome" value={dadosForm.nome} onChange={handleDadosChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>CPF</Form.Label>
                                <Form.Control type="text" name="cpf" value={dadosForm.cpf} onChange={handleDadosChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email (Login)</Form.Label>
                                <Form.Control type="email" value={dadosForm.email} disabled className="bg-light" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr className="my-4" />
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <Button variant="outline-danger" size="sm" onClick={handleAbrirModalSenha}>
                            <ShieldLock className="me-2"/> Alterar Senha
                        </Button>
                        <Button className="btn-success text-white" type="submit" disabled={isSavingDados}>
                            {isSavingDados ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </Form>
              </div>
            </Tab>

            {/* ABA ATIVIDADE */}
            <Tab eventKey="atividade" title={<><ClockHistory className="me-2"/>Minha Atividade</>}>
              <div className="p-4">
                <Row>
                    <Col md={6} className="border-end">
                        <h6 className="text-uppercase text-muted fw-bold small mb-3">Navegação Recente</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {historicoNavegacao && historicoNavegacao.length > 0 ? (
                                historicoNavegacao.map((rota: string, i: number) => (
                                    <span key={i} className="badge bg-light text-dark border px-3 py-2">
                                        {rota.replace('/', '') || 'Home'}
                                    </span>
                                ))
                            ) : <span className="text-muted fst-italic">Sem histórico recente.</span>}
                        </div>
                        <div className="mt-4">
                            <small className="text-muted">Sessão iniciada em: {dataLogin ? new Date(dataLogin).toLocaleTimeString() : '--:--'}</small>
                        </div>
                    </Col>

                    <Col md={6} className="ps-md-4">
                        <h6 className="text-uppercase text-muted fw-bold small mb-3">Histórico de Votos</h6>
                        <div className="vote-list">
                            {ultimasVotacoes && ultimasVotacoes.length > 0 ? (
                                ultimasVotacoes.map((voto: any, i: number) => (
                                    <div key={i} className="vote-item mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold text-dark">{voto.pauta}</span>
                                            <small className="text-muted">{new Date(voto.data).toLocaleTimeString().slice(0,5)}</small>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-muted small">Escolha: </span>
                                            <span className="text-success fw-bold small">{voto.escolha}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Alert variant="light" className="text-center border text-muted small">
                                    Nenhum voto registrado nesta sessão.
                                </Alert>
                            )}
                        </div>
                    </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* MODAL ALTERAR SENHA */}
      <Modal show={showModalSenha} onHide={handleFecharModalSenha} centered>
        <Modal.Header closeButton>
            <Modal.Title>Alterar Senha</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSenhaSubmit}>
          <Modal.Body>
             {/* ALERTA DE ERRO: Agora mostra qualquer mensagem que vier */}
             {senhaError && <Alert variant="danger" className="py-2 small">{String(senhaError)}</Alert>}
             
             {senhaSuccess && <Alert variant="success" className="py-2 small">{senhaSuccess}</Alert>}

             <Form.Group className="mb-3">
                 <Form.Label>Senha Atual</Form.Label>
                 <Form.Control 
                    type="password" 
                    name="senhaAtual" 
                    value={senhaForm.senhaAtual} 
                    onChange={handleSenhaChange} 
                    required 
                 />
             </Form.Group>
             <Form.Group className="mb-3">
                 <Form.Label>Nova Senha</Form.Label>
                 <Form.Control 
                    type="password" 
                    name="novaSenha" 
                    value={senhaForm.novaSenha} 
                    onChange={handleSenhaChange} 
                    required 
                 />
             </Form.Group>
             <Form.Group className="mb-3">
                 <Form.Label>Confirmar Nova Senha</Form.Label>
                 <Form.Control 
                    type="password" 
                    name="confirmarNovaSenha" 
                    value={senhaForm.confirmarNovaSenha} 
                    onChange={handleSenhaChange} 
                    required 
                 />
             </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalSenha}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isSavingSenha}>
                {isSavingSenha ? <Spinner as="span" animation="border" size="sm"/> : "Salvar Nova Senha"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default PerfilUsuario;