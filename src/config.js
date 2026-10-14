// Configuração lida de variáveis de ambiente, com valores padrão.

export const PORTA = Number(process.env.PORT) || 3000;

// Sem a barra final, para montar as URLs como `${LIFT_API_URL}/Pedidos`.
export const LIFT_API_URL = (
  process.env.LIFT_API_URL || 'https://sistemalift1.com.br/lift_ps/api'
).replace(/\/+$/, '');

// Tempo máximo de espera por uma resposta da API Lift, em milissegundos.
export const TIMEOUT_MS = Number(process.env.LIFT_TIMEOUT_MS) || 5000;
