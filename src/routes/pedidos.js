// Rotas HTTP dos pedidos: recebem a requisição, validam a entrada e chamam o service.
// Não têm regra de negócio: só traduzem HTTP <-> service.

import { Router } from 'express';
import { ErroRequisicaoInvalida } from '../utils/erros.js';

// Aceita só dígitos. Recusa "abc", "1.5", "-1" e "0", e também "1e1" e "0x10",
// que o Number() sozinho aceitaria.
function lerIdPedido(texto) {
  const id = Number(texto);
  if (!/^\d+$/.test(texto) || id <= 0 || !Number.isSafeInteger(id)) {
    throw new ErroRequisicaoInvalida('O id do pedido deve ser um número inteiro positivo');
  }
  return id;
}

// Recebe o service por parâmetro para os testes poderem usar um falso.
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
