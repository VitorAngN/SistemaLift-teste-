import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  montarListaPedidos,
  montarDetalhePedido,
  obterListaPedidos,
  obterDetalhePedido,
} from '../src/services/pedidoService.js';
import { ErroApiLift, ErroNaoEncontrado } from '../src/utils/erros.js';
import { clientes, pedidos, produtos, itens } from './fixtures.js';

// Oráculo: totais conferidos à mão, item por item.
const TOTAIS_ESPERADOS = {
  1: 2693, 2: 13696, 3: 1197, 4: 3588, 5: 10772,
  6: 38376, 7: 4394, 8: 799, 9: 2295, 10: 4487,
};

// Monta a entrada do detalhe do mesmo jeito que a API devolveria para um pedido.
function entradaDoDetalhe(idPedido) {
  const pedido = pedidos.find((p) => p.id === idPedido);
  return {
    pedido,
    cliente: clientes.find((c) => c.id === pedido.cliente),
    itens: itens.filter((i) => i.pedido === idPedido),
    produtos,
  };
}

// API falsa: responde como a Lift (inclusive o sentinela id 0), mas sem rede.
const apiFalsa = {
  listarPedidos: async () => pedidos,
  listarClientes: async () => clientes,
  listarItensPedido: async () => itens,
  listarProdutos: async () => produtos,
  buscarPedido: async (id) =>
    pedidos.find((p) => p.id === id) ?? { id: 0, cliente: 0, data: '00-00-0000' },
  buscarCliente: async (id) =>
    clientes.find((c) => c.id === id) ?? { id: 0, nome: '', cpf: '', email: '' },
  listarItensDoPedido: async (id) => itens.filter((i) => i.pedido === id),
};

describe('montarListaPedidos', () => {
  const lista = montarListaPedidos({ pedidos, clientes, itens, produtos });

  it('devolve os 10 pedidos ordenados por id', () => {
    assert.deepEqual(lista.map((p) => p.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('calcula o total de cada pedido igual ao da planilha', () => {
    for (const pedido of lista) {
      assert.equal(pedido.valorTotal, TOTAIS_ESPERADOS[pedido.id], `pedido ${pedido.id}`);
    }
  });

  it('soma R$ 82.297,00 no total geral', () => {
    const totalGeral = lista.reduce((soma, p) => soma + p.valorTotal, 0);
    assert.equal(totalGeral, 82297);
  });

  it('junta o cliente e converte a data', () => {
    assert.deepEqual(lista[0], {
      id: 1,
      cliente: { id: 3, nome: 'Sérgio Theo Galvão' },
      data: '2000-01-29',
      valorTotal: 2693,
    });
  });

  it('dá total 0 para pedido sem itens', () => {
    const semItensDoPedido8 = itens.filter((i) => i.pedido !== 8);
    const resultado = montarListaPedidos({ pedidos, clientes, itens: semItensDoPedido8, produtos });
    assert.equal(resultado.find((p) => p.id === 8).valorTotal, 0);
  });

  it('não altera os dados recebidos (função pura)', () => {
    const entrada = structuredClone({ pedidos, clientes, itens, produtos });
    montarListaPedidos(entrada);
    assert.deepEqual(entrada, { pedidos, clientes, itens, produtos });
  });

  it('lança ErroApiLift quando o cliente do pedido não existe', () => {
    const pedidosComClienteInvalido = [{ id: 1, cliente: 99, data: '29-01-2000' }];
    assert.throws(
      () => montarListaPedidos({ pedidos: pedidosComClienteInvalido, clientes, itens, produtos }),
      ErroApiLift,
    );
  });

  it('lança ErroApiLift quando um item aponta para produto inexistente', () => {
    const itensComProdutoInvalido = [{ pedido: 1, produto: 99, quantidade: 1 }];
    assert.throws(
      () => montarListaPedidos({ pedidos, clientes, itens: itensComProdutoInvalido, produtos }),
      ErroApiLift,
    );
  });

  it('lança ErroApiLift quando a data do pedido é inválida', () => {
    const pedidosComDataInvalida = [{ id: 1, cliente: 3, data: '31-02-2000' }];
    assert.throws(
      () => montarListaPedidos({ pedidos: pedidosComDataInvalida, clientes, itens, produtos }),
      ErroApiLift,
    );
  });
});

describe('montarDetalhePedido', () => {
  it('monta o pedido 10 com cliente, itens e total', () => {
    assert.deepEqual(montarDetalhePedido(entradaDoDetalhe(10)), {
      id: 10,
      data: '2000-06-02',
      cliente: {
        id: 5,
        nome: 'Bernardo Kaique Souza',
        cpf: '846.893.336-88',
        email: 'bernardokaiquesouza__bernardokaiquesouza@octagonbrasil.com.br',
      },
      itens: [
        { produtoId: 1, nome: 'MESA NARA REDONDA', quantidade: 1, valorUnitario: 1499, valorTotal: 1499 },
        { produtoId: 3, nome: 'ARANDELA SAPHIRA', quantidade: 6, valorUnitario: 299, valorTotal: 1794 },
        { produtoId: 5, nome: 'CADEIRA VENEZA', quantidade: 6, valorUnitario: 199, valorTotal: 1194 },
      ],
      valorTotal: 4487,
    });
  });

  it('confere o total de todos os pedidos com a planilha', () => {
    for (const pedido of pedidos) {
      const detalhe = montarDetalhePedido(entradaDoDetalhe(pedido.id));
      assert.equal(detalhe.valorTotal, TOTAIS_ESPERADOS[pedido.id], `pedido ${pedido.id}`);
    }
  });

  it('dá lista vazia e total 0 para pedido sem itens', () => {
    const detalhe = montarDetalhePedido({ ...entradaDoDetalhe(8), itens: [] });
    assert.deepEqual(detalhe.itens, []);
    assert.equal(detalhe.valorTotal, 0);
  });

  it('lança ErroApiLift quando o cliente vem como sentinela (id 0)', () => {
    const entrada = { ...entradaDoDetalhe(10), cliente: { id: 0, nome: '', cpf: '', email: '' } };
    assert.throws(() => montarDetalhePedido(entrada), ErroApiLift);
  });
});

describe('obterListaPedidos (com API falsa)', () => {
  it('busca as 4 tabelas e devolve a lista montada', async () => {
    const lista = await obterListaPedidos(apiFalsa);
    assert.deepEqual(lista, montarListaPedidos({ pedidos, clientes, itens, produtos }));
  });
});

describe('obterDetalhePedido (com API falsa)', () => {
  it('devolve o detalhe de um pedido que existe', async () => {
    const detalhe = await obterDetalhePedido(10, apiFalsa);
    assert.equal(detalhe.valorTotal, 4487);
    assert.equal(detalhe.cliente.nome, 'Bernardo Kaique Souza');
  });

  it('lança ErroNaoEncontrado (404) quando a API devolve o sentinela', async () => {
    await assert.rejects(obterDetalhePedido(999, apiFalsa), (erro) => {
      assert.ok(erro instanceof ErroNaoEncontrado);
      assert.equal(erro.status, 404);
      assert.equal(erro.message, 'Pedido 999 não encontrado');
      return true;
    });
  });
});
