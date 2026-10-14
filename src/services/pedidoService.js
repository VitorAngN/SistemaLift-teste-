// Regra de negócio dos pedidos: junta as tabelas da API Lift e calcula os totais.
//
// O arquivo tem duas partes:
// - Funções PURAS (montarListaPedidos, montarDetalhePedido): recebem os dados e
//   devolvem o resultado, sem acessar a rede. Os testes usam os JSONs de dados/.
// - Funções com I/O (obterListaPedidos, obterDetalhePedido): buscam na API e
//   entregam os dados para as funções puras.

import * as liftApi from '../clients/liftApi.js';
import { converterDataLift } from '../utils/datas.js';
import { calcularValorItemCentavos, deCentavos } from '../utils/dinheiro.js';
import { ErroApiLift, ErroNaoEncontrado } from '../utils/erros.js';

// A API não devolve 404: um id que não existe volta como um registro com id 0.
const ID_INEXISTENTE = 0;

// ---------------------------------------------------------------------------
// Funções auxiliares
// ---------------------------------------------------------------------------

// Monta um Map de id -> registro: a "tabela hash" do hash join.
// Depois disso, achar um cliente ou produto pelo id custa O(1).
function indexarPorId(registros) {
  return new Map(registros.map((registro) => [registro.id, registro]));
}

// Integridade referencial: toda chave estrangeira precisa apontar para um registro.
// Se não apontar, a API mandou dados inconsistentes e paramos aqui (fail fast).
function exigirRegistro(registro, descricao) {
  if (!registro || registro.id === ID_INEXISTENTE) {
    throw new ErroApiLift(`Dados inconsistentes na API Lift: ${descricao} não existe`);
  }
  return registro;
}

function converterDataDoPedido(pedido) {
  const data = converterDataLift(pedido.data);
  if (data === null) {
    throw new ErroApiLift(`Dados inconsistentes na API Lift: data inválida no pedido ${pedido.id}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Funções puras
// ---------------------------------------------------------------------------

// Tela "Lista de Pedidos": cada pedido com o nome do cliente, a data e o valor total.
export function montarListaPedidos({ pedidos, clientes, itens, produtos }) {
  const clientesPorId = indexarPorId(clientes);
  const produtosPorId = indexarPorId(produtos);

  // Agrupamento: soma o valor dos itens de cada pedido (como GROUP BY pedido + SUM no SQL).
  const totalCentavosPorPedido = new Map();
  for (const item of itens) {
    const produto = exigirRegistro(produtosPorId.get(item.produto), `produto ${item.produto}`);
    const valorItem = calcularValorItemCentavos(produto.valor, item.quantidade);
    const acumulado = totalCentavosPorPedido.get(item.pedido) ?? 0;
    totalCentavosPorPedido.set(item.pedido, acumulado + valorItem);
  }

  return pedidos
    .map((pedido) => {
      const cliente = exigirRegistro(
        clientesPorId.get(pedido.cliente),
        `cliente ${pedido.cliente} do pedido ${pedido.id}`,
      );

      return {
        id: pedido.id,
        cliente: { id: cliente.id, nome: cliente.nome },
        data: converterDataDoPedido(pedido),
        valorTotal: deCentavos(totalCentavosPorPedido.get(pedido.id) ?? 0),
      };
    })
    .sort((a, b) => a.id - b.id);
}

// Tela "Informações do Pedido": dados do cliente, itens com valor e total do pedido.
export function montarDetalhePedido({ pedido, cliente, itens, produtos }) {
  exigirRegistro(cliente, `cliente ${pedido.cliente} do pedido ${pedido.id}`);
  const produtosPorId = indexarPorId(produtos);

  const itensDetalhados = [];
  let totalCentavos = 0;

  for (const item of itens) {
    const produto = exigirRegistro(produtosPorId.get(item.produto), `produto ${item.produto}`);
    const valorItemCentavos = calcularValorItemCentavos(produto.valor, item.quantidade);
    totalCentavos += valorItemCentavos;

    itensDetalhados.push({
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: item.quantidade,
      valorUnitario: produto.valor,
      valorTotal: deCentavos(valorItemCentavos),
    });
  }

  return {
    id: pedido.id,
    data: converterDataDoPedido(pedido),
    cliente: { id: cliente.id, nome: cliente.nome, cpf: cliente.cpf, email: cliente.email },
    itens: itensDetalhados,
    valorTotal: deCentavos(totalCentavos),
  };
}

// ---------------------------------------------------------------------------
// Funções com I/O
// O parâmetro `api` tem como padrão o client real; os testes passam uma API falsa.
// ---------------------------------------------------------------------------

export async function obterListaPedidos(api = liftApi) {
  // As 4 buscas são independentes: rodam em paralelo (4 requisições, não 1 + N).
  const [pedidos, clientes, itens, produtos] = await Promise.all([
    api.listarPedidos(),
    api.listarClientes(),
    api.listarItensPedido(),
    api.listarProdutos(),
  ]);

  return montarListaPedidos({ pedidos, clientes, itens, produtos });
}

export async function obterDetalhePedido(id, api = liftApi) {
  // 1ª rodada: o pedido diz quem é o cliente, então ele vem antes.
  const pedido = await api.buscarPedido(id);
  if (pedido.id === ID_INEXISTENTE) {
    throw new ErroNaoEncontrado(`Pedido ${id} não encontrado`);
  }

  // 2ª rodada: cliente, itens e produtos são independentes e rodam em paralelo.
  // Trade-off: 1 chamada com os 7 produtos sai mais barato que 1 chamada por item.
  // Com um catálogo de milhares de produtos, buscar só os do pedido seria melhor.
  const [cliente, itens, produtos] = await Promise.all([
    api.buscarCliente(pedido.cliente),
    api.listarItensDoPedido(pedido.id),
    api.listarProdutos(),
  ]);

  return montarDetalhePedido({ pedido, cliente, itens, produtos });
}
