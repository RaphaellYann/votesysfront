import { Outlet } from "react-router-dom";

// URL da imagem de fundo
const bgImage = "https://th.bing.com/th/id/R.04a35802c927cc8eb764f587ffba24c7?rik=pDXKC2JxL5cWXw&pid=ImgRaw&r=0";

const layoutStyle = {
  backgroundImage: `url("${bgImage}")`,
  backgroundRepeat: "no-repeat", // não repetir
  backgroundSize: "cover", // cobre toda a tela
  backgroundPosition: "center", // centralizar
};

function LayoutLogin() {
  return (
    // Container principal que ocupa a tela inteira e centraliza o conteúdo
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={layoutStyle}
    >
      {/* Card centralizado que conterá o formulário */}
      <div className="col-11 col-sm-10 col-md-7 col-lg-5 col-xl-4 bg-white p-4 p-md-5 rounded-3 shadow">
        {/* Logo ou Título (Opcional) */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">Bem-vindo(a)</h2>
          <p className="text-muted">
            Acesse sua conta ou crie um novo cadastro.
          </p>
        </div>

        {/* Onde o React Router renderiza Login ou Cadastro */}
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutLogin;
