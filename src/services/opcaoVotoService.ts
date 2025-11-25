import api from "./api";

export interface OpcaoVoto {
  id: number;
  nome: string;
  totalVotos: number;
}

export interface OpcaoVotoCreateRequest {
  nome: string;
  campanhaId: number;
}

export async function buscarOpcoesPorCampanha(
  campanhaId: number
): Promise<OpcaoVoto[]> {
  const response = await api.get<OpcaoVoto[]>(
    `/opcaoVoto/por-campanha/${campanhaId}`
  );
  return response.data;
}

export async function adicionarOpcao(
  request: OpcaoVotoCreateRequest
): Promise<OpcaoVoto> {
  const response = await api.post<OpcaoVoto>("/opcaoVoto", request);
  return response.data;
}

export async function excluirOpcao(id: number): Promise<void> {
  await api.delete(`/opcaoVoto/${id}`);
}