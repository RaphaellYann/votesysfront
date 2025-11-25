import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";

import { recuperarSenha } from "../../services/authService"; // Ajuste o caminho

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await recuperarSenha({ email });
      setSuccess("Você receberá um link de recuperação em instantes.");
    } catch {
      setError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <>
          <h2>Email enviado!</h2>
          <div className="form-subtitle">
            Verifique sua caixa de entrada (e spam).
          </div>

          <Alert variant="success" className="login-alert mt-4">
            {success}
          </Alert>

          <div className="login-links">
            <Link to="/login">
              <ArrowLeft size={14} /> Voltar ao Login
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2>Recuperar Senha</h2>
          <div className="form-subtitle">
            Insira seu email para enviarmos o link de recuperação.
          </div>

          {error && (
            <Alert variant="danger" className="login-alert">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="login-form">
            <Form.Group className="mb-4" controlId="emailInput">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Insira seu endereço de e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                  Enviando...
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>
          </Form>

          <div className="login-links">
            <Link to="/login">Lembrou a senha? Faça o login</Link>
          </div>
        </>
      )}
    </>
  );
}

export default RecuperarSenha;