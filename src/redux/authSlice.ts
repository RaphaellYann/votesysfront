import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Usuario {
  id?: number;
  email: string;
  nome: string;
  role: string;
  cpf?: string;
}

export interface VotoActivity {
  id: number;
  pauta: string;
  escolha: string; 
  data: string; 
}

interface AuthState {
  isAutenticado: boolean;
  usuario: Usuario | null;
  token: string | null;
  dataLogin: string | null;
  historicoNavegacao: string[]; 
  ultimasVotacoes: VotoActivity[];
}

const initialState: AuthState = {
  isAutenticado: false,
  usuario: null,
  token: null,
  dataLogin: null,
  historicoNavegacao: [],
  ultimasVotacoes: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSucesso: (state, action: PayloadAction<{ usuario: Usuario; token: string }>) => {
      state.isAutenticado = true;
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
      state.dataLogin = new Date().toISOString();
      state.historicoNavegacao = ["/login"]; // Reseta ao logar
    },
    logout: (state) => {
      state.isAutenticado = false;
      state.token = null;
      state.usuario = null;
      state.dataLogin = null;
      state.historicoNavegacao = [];
      state.ultimasVotacoes = [];
    },
    updateUsuario: (state, action: PayloadAction<Usuario>) => {
      state.usuario = { ...state.usuario, ...action.payload };
    },

    adicionarNavegacao: (state, action: PayloadAction<string>) => {
      const novaRota = action.payload;
      const ultimo = state.historicoNavegacao[state.historicoNavegacao.length - 1];
      
      if (ultimo !== novaRota) {
        state.historicoNavegacao.push(novaRota);
        if (state.historicoNavegacao.length > 5) {
          state.historicoNavegacao.shift(); // Remove a mais antiga
        }
      }
    },

    adicionarVoto: (state, action: PayloadAction<VotoActivity>) => {
       state.ultimasVotacoes.unshift(action.payload);
       if (state.ultimasVotacoes.length > 5) state.ultimasVotacoes.pop();
    }
  },
});

export const { loginSucesso, logout, updateUsuario, adicionarNavegacao, adicionarVoto } = authSlice.actions;
export default authSlice.reducer;