// Middlewares que transformam erros em respostas HTTP em JSON: { "erro": "mensagem" }.

import { ErroAplicacao } from '../utils/erros.js';

// Qualquer /api/... que nenhuma rota atendeu.
export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// Middleware de erro: o Express o reconhece por ter 4 parâmetros.
// No Express 5, um erro lançado numa rota async chega aqui sozinho.
export function tratarErros(erro, req, res, next) {
  // Se a resposta já começou a ser enviada, só o Express consegue encerrá-la.
  if (res.headersSent) return next(erro);

  // Nossos erros já sabem o próprio status (400, 404, 502).
  if (erro instanceof ErroAplicacao) {
    if (erro.status >= 500) console.error(`[${erro.name}] ${erro.message}`, erro.cause ?? '');
    return res.status(erro.status).json({ erro: erro.message });
  }

  // Erros do próprio Express com status 4xx (ex.: URL malformada).
  if (erro.status >= 400 && erro.status < 500) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  // Qualquer outra coisa é um bug: o detalhe vai para o log, nunca para o cliente.
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno no servidor' });
}
