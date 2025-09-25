import { Link } from "react-router-dom";

// O nome da função agora é Cadastrese()
function Cadastrese() {
  return (
    <div> {/* <-- Esta é a <div> de abertura que estava faltando */}
      <div className="card shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-5">
          <h3 className="card-title text-center mb-4">Cadastre-se</h3>
          <form>
            <div className="mb-3">
              <label htmlFor="nameInput" className="form-label">
                Nome completo
              </label>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                placeholder="Seu nome"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="emailInput"
                placeholder="seu@email.com"
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
                placeholder="Crie uma senha forte"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Cadastre-se
            </button>
          </form>
          <div className="text-center mt-4">
            <small className="text-secondary">
              Já tem uma conta? <Link to="/login">Faça o login</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

// A exportação também foi ajustada
export default Cadastrese;