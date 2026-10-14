// Rotas HTTP dos pedidos: recebem a requisição, validam a entrada e chamam o service.
// Não têm regra de negócio: só traduzem HTTP <-> service.

import { Router } from 'express';
import { ErroRequisicaoInvalida } from '../utils/erros.js';

// O id chega da URL sempre como texto. Aceita só dígitos ("10") e recusa
// "abc", "1.5", "-1", "0", "1e1" e "0x10" (que o Number() aceitaria).
function lerIdPedido(texto) {
  const id = Number(texto);
  if (!/^\d+$/.test(texto) || id <= 0 || !Number.isSafeInteger(id)) {
    throw new ErroRequisicaoInvalida('O id do pedido deve ser um número inteiro positivo');
  }
  return id;
}

// `servico` é recebido por parâmetro (o pedidoService de verdade, ou um falso nos testes).
export function criarRotasPedidos(servico) {
  const rotas = Router();

  // GET /api/pedidos -> dados da tela "Lista de Pedidos"
  rotas.get('/', async (req, res) => {
    res.json(await servico.obterListaPedidos());
  });

  // GET /api/pedidos/:id -> dados da tela "Informações do Pedido"
  rotas.get('/:id', async (req, res) => {
    const id = lerIdPedido(req.params.id);
    res.json(await servico.obterDetalhePedido(id));
  });

  return rotas;
}
