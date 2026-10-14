import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { criarApp } from '../src/app.js';
import { ErroApiLift, ErroNaoEncontrado } from '../src/utils/erros.js';

const LISTA = [{ id: 1, cliente: { id: 3, nome: 'Sérgio Theo Galvão' }, data: '2000-01-29', valorTotal: 2693 }];

// Service falso: cada id simula uma situação diferente.
const idsPedidos = [];
const servicoFalso = {
  obterListaPedidos: async () => LISTA,
  obterDetalhePedido: async (id) => {
    idsPedidos.push(id);
    if (id === 999) throw new ErroNaoEncontrado('Pedido 999 não encontrado');
    if (id === 998) throw new ErroApiLift('A API Lift não respondeu em 5000 ms (Pedidos/998)');
    if (id === 997) throw new Error('bug inesperado com detalhe interno');
    return { id, valorTotal: 4487 };
  },
};

let servidor;
let base;

before(async () => {
  servidor = criarApp({ servico: servicoFalso }).listen(0);
  await once(servidor, 'listening');
  base = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

async function get(caminho) {
  const resposta = await fetch(base + caminho);
  return { status: resposta.status, headers: resposta.headers, corpo: await resposta.json() };
}

describe('GET /api/pedidos', () => {
  it('responde 200 com a lista do service em JSON', async () => {
    const { status, headers, corpo } = await get('/api/pedidos');
    assert.equal(status, 200);
    assert.match(headers.get('content-type'), /application\/json/);
    assert.deepEqual(corpo, LISTA);
  });

  it('não anuncia o Express no cabeçalho X-Powered-By', async () => {
    const { headers } = await get('/api/pedidos');
    assert.equal(headers.get('x-powered-by'), null);
  });
});

describe('GET /api/pedidos/:id', () => {
  it('responde 200 com o detalhe e passa o id como número', async () => {
    const { status, corpo } = await get('/api/pedidos/10');
    assert.equal(status, 200);
    assert.deepEqual(corpo, { id: 10, valorTotal: 4487 });
    assert.equal(idsPedidos.at(-1), 10);
  });

  it('responde 400 para id inválido, sem chamar o service', async () => {
    const chamadasAntes = idsPedidos.length;
    for (const id of ['abc', '1.5', '-1', '0', '1e1', '0x10']) {
      const { status, corpo } = await get(`/api/pedidos/${id}`);
      assert.equal(status, 400, `id "${id}"`);
      assert.equal(corpo.erro, 'O id do pedido deve ser um número inteiro positivo');
    }
    assert.equal(idsPedidos.length, chamadasAntes);
  });

  it('responde 404 quando o pedido não existe', async () => {
    const { status, corpo } = await get('/api/pedidos/999');
    assert.equal(status, 404);
    assert.deepEqual(corpo, { erro: 'Pedido 999 não encontrado' });
  });

  it('responde 502 quando a API Lift falha', async (t) => {
    t.mock.method(console, 'error', () => {}); // silencia o log esperado
    const { status, corpo } = await get('/api/pedidos/998');
    assert.equal(status, 502);
    assert.match(corpo.erro, /API Lift/);
  });

  it('responde 500 genérico para um bug, sem vazar o detalhe', async (t) => {
    t.mock.method(console, 'error', () => {});
    const { status, corpo } = await get('/api/pedidos/997');
    assert.equal(status, 500);
    assert.deepEqual(corpo, { erro: 'Erro interno no servidor' });
  });
});

describe('rotas desconhecidas', () => {
  it('responde 404 em JSON para /api/qualquer-coisa', async () => {
    const { status, corpo } = await get('/api/clientes');
    assert.equal(status, 404);
    assert.equal(corpo.erro, 'Rota não encontrada: GET /api/clientes');
  });
});
