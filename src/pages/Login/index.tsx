import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL_LOGIN = "http://localhost:8080/auth/login"; // ajuste conforme seu backend

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(API_URL_LOGIN, { email, senha });

      // supondo que o backend devolve { token: "jwt..." }
      localStorage.setItem("token", response.data.token);

      navigate("/"); // redireciona após login
    } catch (err) {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
      <div className="card-body p-5">
        <h3 className="card-title text-center mb-4">Entrar</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-secondary">
            Não tem uma conta? <Link to="/cadastrese">Cadastre-se aqui</Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
