import api from "./api";


export interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  tipoCampanha: string;
  totalVotos?: number;
}

export interface CampanhaRequest {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  tipoCampanha: string;

}

// Funções de API
export async function buscarTodasCampanhas(): Promise<Campanha[]> {
  const response = await api.get<Campanha[]>("/campanhas");
  return response.data;
}

export async function criarCampanha(request: CampanhaRequest): Promise<Campanha> {
  const response = await api.post<Campanha>("/campanhas", request);
  return response.data;
}

export async function atualizarCampanha(id: number, request: CampanhaRequest): Promise<Campanha> {
  const response = await api.put<Campanha>(`/campanhas/${id}`, request);
  return response.data;
}

export async function excluirCampanha(id: number): Promise<void> {
  await api.delete(`/campanhas/${id}`);
}


export async function buscarCampanhasParaResultados(): Promise<Campanha[]> {
  const response = await api.get<Campanha[]>("/campanhas/resultados");
  return response.data;
}