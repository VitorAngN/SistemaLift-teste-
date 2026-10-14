// Monta a aplicação Express. Fica separado do server.js para os testes
// poderem subir o app numa porta qualquer.

import express from 'express';
import { fileURLToPath } from 'node:url';
import * as pedidoService from './services/pedidoService.js';
import { criarRotasPedidos } from './routes/pedidos.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

const PASTA_PUBLICA = fileURLToPath(new URL('../public', import.meta.url));

// O service de verdade é o padrão; os testes passam um falso.
export function criarApp({ servico = pedidoService } = {}) {
  const app = express();

  // Não anuncia "X-Powered-By: Express" nas respostas.
  app.disable('x-powered-by');

  // A ordem importa: cada requisição passa pelos middlewares de cima para baixo.
  app.use(express.static(PASTA_PUBLICA)); // telas (HTML, CSS e JS) de public/
  app.use('/api/pedidos', criarRotasPedidos(servico)); // nossa API
  app.use('/api', rotaNaoEncontrada); // qualquer outro /api/... vira 404 em JSON
  app.use(tratarErros); // sempre por último

  return app;
}
