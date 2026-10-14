// Camada de acesso à API do Sistema Lift.
// É o ÚNICO arquivo do projeto que faz requisições HTTP para a Lift.
// O resto do código chama estas funções e recebe os dados já em objeto JS.

import { LIFT_API_URL, TIMEOUT_MS } from '../config.js';
import { ErroApiLift } from '../utils/erros.js';

async function buscar(caminho) {
  const url = `${LIFT_API_URL}/${caminho}`;

  let resposta;
  try {
    // AbortSignal.timeout cancela a requisição se a API demorar demais.
    resposta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (erro) {
    // A requisição nem teve resposta: estourou o tempo ou a rede falhou.
    const motivo =
      erro.name === 'TimeoutError' ? `não respondeu em ${TIMEOUT_MS} ms` : 'está inacessível';
    throw new ErroApiLift(`A API Lift ${motivo} (${caminho})`, { cause: erro });
  }

  // O fetch NÃO lança erro para 404 ou 500: a verificação é manual.
  if (!resposta.ok) {
    throw new ErroApiLift(`A API Lift respondeu HTTP ${resposta.status} (${caminho})`);
  }

  try {
    return await resposta.json();
  } catch (erro) {
    throw new ErroApiLift(`A API Lift devolveu uma resposta que não é JSON (${caminho})`, {
      cause: erro,
    });
  }
}

// Um método para cada endpoint descrito no e-mail.
export const listarClientes = () => buscar('Clientes');
export const buscarCliente = (id) => buscar(`Clientes/${id}`);

export const listarPedidos = () => buscar('Pedidos');
export const buscarPedido = (id) => buscar(`Pedidos/${id}`);

export const listarProdutos = () => buscar('Produtos');
export const buscarProduto = (id) => buscar(`Produtos/${id}`);

export const listarItensPedido = () => buscar('ItensPedido');
export const listarItensDoPedido = (pedidoId) => buscar(`ItensPedido/${pedidoId}`);
