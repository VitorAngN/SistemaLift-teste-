// Tela "Lista de Pedidos": busca /api/pedidos e monta a tabela.
// Os textos entram com textContent, nunca innerHTML, para evitar XSS.

import { buscarJson } from './api.js';
import { formatarMoeda, formatarData } from './formatar.js';

const corpoTabela = document.querySelector('#pedidos tbody');
const resumo = document.querySelector('#resumo');

function celula(texto, classe) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

function linhaPedido(pedido) {
  const link = document.createElement('a');
  link.className = 'link-pedido';
  link.href = `pedido.html?id=${pedido.id}`;
  link.textContent = pedido.id;
  link.setAttribute('aria-label', `Ver o pedido ${pedido.id}`);

  const codigo = document.createElement('td');
  codigo.append(link);

  const linha = document.createElement('tr');
  linha.append(
    codigo,
    celula(pedido.cliente.nome),
    celula(formatarData(pedido.data)),
    celula(formatarMoeda(pedido.valorTotal), 'valor'),
  );
  return linha;
}

// Uma linha ocupando a tabela inteira, para os estados carregando, vazio e erro.
function mostrarMensagem(texto, tipo, comBotao = false) {
  const td = document.createElement('td');
  td.colSpan = 4;
  td.append(texto);

  if (comBotao) {
    const botao = document.createElement('button');
    botao.className = 'botao';
    botao.type = 'button';
    botao.textContent = 'Tentar de novo';
    botao.addEventListener('click', carregar);
    td.append(document.createElement('br'), botao);
  }

  const linha = document.createElement('tr');
  linha.className = `mensagem mensagem--${tipo}`;
  linha.append(td);
  corpoTabela.replaceChildren(linha);
}

function mostrarResumo(pedidos) {
  // Soma em centavos para evitar erro de arredondamento.
  const totalCentavos = pedidos.reduce((soma, p) => soma + Math.round(p.valorTotal * 100), 0);

  const quantidade = document.createElement('strong');
  quantidade.textContent = pedidos.length;
  const total = document.createElement('strong');
  total.textContent = formatarMoeda(totalCentavos / 100);

  resumo.replaceChildren(quantidade, ' pedidos · total de ', total);
}

async function carregar() {
  mostrarMensagem('Carregando pedidos…', 'carregando');
  resumo.replaceChildren();

  try {
    const pedidos = await buscarJson('/api/pedidos');

    if (pedidos.length === 0) {
      mostrarMensagem('Nenhum pedido encontrado.', 'vazio');
      return;
    }

    corpoTabela.replaceChildren(...pedidos.map(linhaPedido));
    mostrarResumo(pedidos);
  } catch (erro) {
    mostrarMensagem(`Não foi possível carregar os pedidos. ${erro.message}`, 'erro', true);
  }
}

carregar();
