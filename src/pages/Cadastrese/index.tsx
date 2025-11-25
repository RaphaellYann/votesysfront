import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

import {
  cadastrarUsuario,
  type UsuarioCadastroRequest,
} from "../../services/usuarioService.ts";

interface CadastroFormState {
  nome: string;
  email: string;
  senha: string;
}

function Cadastresse() {
  const [formData, setFormData] = useState<CadastroFormState>({
    nome: "",
    email: "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const requestData: UsuarioCadastroRequest = {
      ...formData,
    };

    try {
      await cadastrarUsuario(requestData);

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const message =
        err.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "Ocorreu um erro ao cadastrar. Tente novamente.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Crie sua conta</h2>
      <div className="form-subtitle">
        Já tem uma conta? <Link to="/login">Faça o login</Link>
      </div>

      {error && (
        <Alert variant="danger" className="login-alert">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="login-alert">
          Cadastro realizado! Redirecionando para o login...
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Group className="mb-3" controlId="nameInput">
          <Form.Label>Nome completo</Form.Label>
          <Form.Control
            type="text"
            placeholder="Seu nome completo"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
  _         />
        </Form.Group>

        <Form.Group className="mb-3" controlId="emailInput">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="seu@email.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="passwordInput">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            placeholder="Crie uma senha forte"
            name="senha"
      _       value={formData.senha}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 btn-login-submit"
          disabled={loading || success}
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
              Cadastrando...
            </>
          ) : (
            "Cadastre-se"
          )}
        </Button>
      </Form>
    </>
  );
}

export default Cadastresse;