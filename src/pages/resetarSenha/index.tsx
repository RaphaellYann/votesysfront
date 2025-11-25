import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";


// const API_URL_RESET = "http://localhost:8080/auth/resetarsenha";

import { resetarSenha } from "../../services/authService"; 

function ResetarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    senha: "",
    confirmarSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tokenDaUrl = searchParams.get("token");
    if (tokenDaUrl) {
      setToken(tokenDaUrl);
    } else {
      setError("Token não encontrado na URL. Solicite um novo link.");
    }
  }, [searchParams]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!token) {
      setError("Token não informado. Não é possível resetar a senha.");
      return;
    }

    setLoading(true);

    try {
      await resetarSenha({ token: token, senha: formData.senha });
      setSuccess("Senha alterada com sucesso! Você já pode fazer login.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {

      if (err.response?.data) {
        const mensagemErro =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.mensagem;
        setError(mensagemErro || "Erro desconhecido ao redefinir senha.");
      } else {
        setError("Não foi possível redefinir a senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Defina sua nova senha</h2>
      <div className="form-subtitle">
        Insira e confirme sua nova senha de acesso.
      </div>

      {error && (
        <Alert variant="danger" className="login-alert">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="login-alert">
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Group className="mb-3" controlId="passwordInput">
          <Form.Label>Nova Senha</Form.Label>
          <Form.Control
            type="password"
            placeholder="Digite sua nova senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            disabled={loading || !!success}
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="confirmPasswordInput">
          <Form.Label>Confirmar Nova Senha</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirme sua nova senha"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            disabled={loading || !!success}
          />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 btn-login-submit"
          disabled={loading || !!success}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Salvando...
            </>
          ) : (
            "Salvar Nova Senha"
          )}
        </Button>
      </Form>

      {success && (
        <div className="login-links mt-3">
          <Link to="/login">Voltar para o Login</Link>
        </div>
      )}
    </>
  );
}

export default ResetarSenha;