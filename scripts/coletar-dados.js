// Busca as 4 listas da API Lift e salva cada uma em dados/<nome>.json.
// Uso: npm run coletar
//
// Serve para estudar o formato dos dados e, depois, como dados de exemplo
// para os testes.

import { mkdir, writeFile } from 'node:fs/promises';
import {
  listarClientes,
  listarPedidos,
  listarProdutos,
  listarItensPedido,
} from '../src/clients/liftApi.js';

const PASTA_SAIDA = new URL('../dados/', import.meta.url);

async function main() {
  console.log('Buscando dados da API Lift...\n');

  // As 4 requisições são independentes, então rodam em paralelo.
  const [clientes, pedidos, produtos, itensPedido] = await Promise.all([
    listarClientes(),
    listarPedidos(),
    listarProdutos(),
    listarItensPedido(),
  ]);

  await mkdir(PASTA_SAIDA, { recursive: true });

  const colecoes = { clientes, pedidos, produtos, itensPedido };

  for (const [nome, registros] of Object.entries(colecoes)) {
    const arquivo = new URL(`${nome}.json`, PASTA_SAIDA);
    await writeFile(arquivo, JSON.stringify(registros, null, 2) + '\n', 'utf-8');
    console.log(`  dados/${nome}.json  (${registros.length} registros)`);
  }

  console.log('\nPedidos:');
  console.table(pedidos);
  console.log('Itens de pedido:');
  console.table(itensPedido);
}

main().catch((erro) => {
  console.error('Erro ao coletar dados:', erro.message);
  process.exitCode = 1;
});
