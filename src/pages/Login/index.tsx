import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store"; 
import { loginSucesso } from "../../redux/authSlice"; 
import { LoginNovo, type LoginRequest } from "../../services/authService"; // Ajuste o caminho

function Login() {

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const dispatch: AppDispatch = useDispatch();


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

    try {

      const loginResponse = await LoginNovo(formData);

      dispatch(
        loginSucesso({
          usuario: loginResponse.usuario, 
          token: loginResponse.token,
        })
      );

      navigate("/"); 
    } catch (err: any) {

      const message =
        err.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "Email ou senha inválidos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Entre na sua conta</h2>
      <div className="form-subtitle">
        Ainda não tem uma conta?{" "}
        <Link to="/cadastrese">Cadastrar-se</Link>
      </div>

      {error && (
        <Alert variant="danger" className="login-alert">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Group className="mb-3" controlId="emailInput">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Insira seu endereço de e-mail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="passwordInput">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            placeholder="Digite sua senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="rememberMeCheck">
          <Form.Check type="checkbox" label="Lembrar-me" />
        </Form.Group>

        <Button
          type="submit"
          className="w-100 btn-login-submit"
          disabled={loading}
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
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </Form>

      <div className="login-links">
        <Link to="/recuperarsenha">Esqueceu sua senha?</Link>
      </div>
    </>
  );
}

export default Login;