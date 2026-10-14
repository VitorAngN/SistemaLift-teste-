// Tela "Informações do Pedido": lê o id da URL (pedido.html?id=10),
// busca /api/pedidos/10 e preenche os dados do cliente, os itens e o total.
// Como na lista, tudo entra com textContent (nunca innerHTML).

import { buscarJson } from './api.js';
import { formatarMoeda, formatarData, formatarQuantidade } from './formatar.js';

const estado = document.querySelector('#estado');
const detalhe = document.querySelector('#detalhe');
const numeroPedido = document.querySelector('#numero-pedido');
const corpoItens = document.querySelector('#itens tbody');

function preencher(id, texto) {
  document.getElementById(id).textContent = texto;
}

function celula(conteudo, classe) {
  const td = document.createElement('td');
  td.append(...conteudo);
  if (classe) td.className = classe;
  return td;
}

function linhaItem(item) {
  // Mostra a conta embaixo do valor: "6 × R$ 299,00".
  const conta = document.createElement('small');
  conta.className = 'detalhe-conta';
  conta.textContent = `${formatarQuantidade(item.quantidade)} × ${formatarMoeda(item.valorUnitario)}`;

  const linha = document.createElement('tr');
  linha.append(
    celula([String(item.produtoId)]),
    celula([item.nome]),
    celula([formatarQuantidade(item.quantidade)], 'valor'),
    celula([formatarMoeda(item.valorTotal), conta], 'valor'),
  );
  return linha;
}

function mostrarPedido(pedido) {
  const prefixo = document.createElement('span');
  prefixo.textContent = 'Nº ';
  numeroPedido.replaceChildren(prefixo, String(pedido.id));
  document.title = `Pedido ${pedido.id} · Sistema Lift`;

  preencher('cliente-nome', pedido.cliente.nome);
  preencher('cliente-cpf', pedido.cliente.cpf);
  preencher('pedido-data', formatarData(pedido.data));
  preencher('cliente-email', pedido.cliente.email);

  if (pedido.itens.length === 0) {
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Este pedido não tem itens.';
    const linha = document.createElement('tr');
    linha.className = 'mensagem mensagem--vazio';
    linha.append(td);
    corpoItens.replaceChildren(linha);
  } else {
    corpoItens.replaceChildren(...pedido.itens.map(linhaItem));
  }

  preencher('total', formatarMoeda(pedido.valorTotal));

  estado.hidden = true;
  detalhe.hidden = false;
}

// acao: 'voltar' (o pedido não existe ou o id é inválido) ou 'tentar' (falha temporária).
function mostrarEstado(texto, tipo, acao) {
  estado.className = `cartao estado estado--${tipo}`;
  estado.replaceChildren(texto);

  if (acao === 'voltar') {
    const link = document.createElement('a');
    link.className = 'botao';
    link.href = './';
    link.textContent = 'Voltar para a lista';
    estado.append(document.createElement('br'), link);
  } else if (acao === 'tentar') {
    const botao = document.createElement('button');
    botao.className = 'botao';
    botao.type = 'button';
    botao.textContent = 'Tentar de novo';
    botao.addEventListener('click', carregar);
    estado.append(document.createElement('br'), botao);
  }

  detalhe.hidden = true;
  estado.hidden = false;
}

async function carregar() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    mostrarEstado('Nenhum pedido foi informado.', 'erro', 'voltar');
    return;
  }

  mostrarEstado('Carregando pedido…', 'carregando');

  try {
    // encodeURIComponent impede que um id como "1/../x" vire outro caminho da API.
    const pedido = await buscarJson(`/api/pedidos/${encodeURIComponent(id)}`);
    mostrarPedido(pedido);
  } catch (erro) {
    // 400 e 404: tentar de novo não adianta, então o botão é para voltar.
    const definitivo = erro.status === 400 || erro.status === 404;
    mostrarEstado(erro.message, 'erro', definitivo ? 'voltar' : 'tentar');
  }
}

carregar();
