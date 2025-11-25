import api from "./api";

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  role: string;
}

export interface UsuarioCadastroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AdminUsuarioRequest {
  nome: string;
  email: string;
  senha?: string | null;
  cpf: string;
  role: string;
}

export interface UsuarioRequestDTO {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  role: string;
  senha?: string | null;
}

export interface AlterarSenhaDTO {
  email: string;
  senhaAtual: string;
  novaSenha: string;
}

export async function buscarTodosUsuarios(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>("/usuarios");
  return response.data;
}

export async function cadastrarUsuario(
  request: UsuarioCadastroRequest
): Promise<void> {
  await api.post("/usuarios", request);
}

export async function adminAtualizarUsuario(
  id: number,
  request: Partial<AdminUsuarioRequest>
): Promise<void> {
  await api.put(`/usuarios/${id}`, request);
}

export const atualizarProprioUsuario = async (
  id: number,
  data: UsuarioRequestDTO
): Promise<Usuario> => {
  try {
    const response = await api.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error.response?.data);
    throw error;
  }
};

export const alterarPropriaSenha = async (
  data: AlterarSenhaDTO
): Promise<string> => {
  try {
    const response = await api.post<string>("/auth/alterarsenha", data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error.response?.data);
    throw error;
  }
};

// recuperara senha (rota pública)
export interface RecuperarSenhaRequest {
  email: string;
}

export async function solicitarRecuperacaoSenha(
  request: RecuperarSenhaRequest
): Promise<void> {
  await api.post("/auth/recuperarsenha", request);
}