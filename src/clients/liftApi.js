// Camada de acesso à API do Sistema Lift.
// É o ÚNICO arquivo do projeto que sabe a URL da API e faz requisições HTTP.
// O resto do código chama estas funções e recebe os dados já em objeto JS.

const BASE_URL = 'https://sistemalift1.com.br/lift_ps/api';
const TIMEOUT_MS = 5000;

async function buscar(caminho) {
  const url = `${BASE_URL}/${caminho}`;

  // AbortSignal.timeout cancela a requisição se a API demorar demais.
  const resposta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${url}: HTTP ${resposta.status}`);
  }

  return resposta.json();
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
