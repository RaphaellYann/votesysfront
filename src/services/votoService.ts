import api from "./api";


export interface VotoRequest {
  campanhaId: number;
  opcoesIds: number[];
}

export async function enviarVoto(request: VotoRequest): Promise<void> {
  await api.post("/votos", request);
}