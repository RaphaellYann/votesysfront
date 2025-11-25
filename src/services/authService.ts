import api from "./api";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    email: string;
    nome: string;
    role: string;
  };
}

export async function LoginNovo(
  loginRequest: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("auth/login", loginRequest);
  return response.data;
}

// recuperar senha
export interface RecuperarSenhaRequest {
  email: string;
}

export async function recuperarSenha(
  request: RecuperarSenhaRequest
): Promise<void> {
  await api.post("/auth/recuperarsenha", request);
}

// resetar senha
export interface ResetarSenhaRequest {
  token: string;
  senha: string;
}

export async function resetarSenha(
  request: ResetarSenhaRequest
): Promise<void> {
  await api.post("/auth/resetarsenha", request);
}