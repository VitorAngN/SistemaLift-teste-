// Acesso à API do Sistema Lift: é o único arquivo que faz requisições para ela.

import { LIFT_API_URL, TIMEOUT_MS } from '../config.js';
import { ErroApiLift } from '../utils/erros.js';

async function buscar(caminho) {
  const url = `${LIFT_API_URL}/${caminho}`;

  let resposta;
  try {
    // AbortSignal.timeout cancela a requisição se a API demorar demais.
    resposta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (erro) {
    // Sem resposta: estourou o tempo ou a rede falhou.
    const motivo =
      erro.name === 'TimeoutError' ? `não respondeu em ${TIMEOUT_MS} ms` : 'está inacessível';
    throw new ErroApiLift(`A API Lift ${motivo} (${caminho})`, { cause: erro });
  }

  // O fetch não lança erro para respostas 4xx e 5xx, então a verificação é manual.
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

// Uma função para cada endpoint da API.
export const listarClientes = () => buscar('Clientes');
export const buscarCliente = (id) => buscar(`Clientes/${id}`);

export const listarPedidos = () => buscar('Pedidos');
export const buscarPedido = (id) => buscar(`Pedidos/${id}`);

export const listarProdutos = () => buscar('Produtos');
export const buscarProduto = (id) => buscar(`Produtos/${id}`);

export const listarItensPedido = () => buscar('ItensPedido');
export const listarItensDoPedido = (pedidoId) => buscar(`ItensPedido/${pedidoId}`);
