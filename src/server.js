// Ponto de entrada: sobe o servidor HTTP. Uso: npm start (ou npm run dev).

import { criarApp } from './app.js';
import { PORTA } from './config.js';

criarApp().listen(PORTA, (erro) => {
  if (erro) {
    console.error(`Não foi possível iniciar o servidor na porta ${PORTA}: ${erro.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
