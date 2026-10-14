// Dados de teste: a "foto" da API Lift salva em dados/ por `npm run coletar`.
// Assim os testes usam dados reais sem depender da internet.
// (Este arquivo não termina em .test.js, então o node --test não o executa como teste.)

import { readFileSync } from 'node:fs';

function lerDados(nome) {
  const arquivo = new URL(`../dados/${nome}.json`, import.meta.url);
  return JSON.parse(readFileSync(arquivo, 'utf-8'));
}

export const clientes = lerDados('clientes');
export const pedidos = lerDados('pedidos');
export const produtos = lerDados('produtos');
export const itens = lerDados('itensPedido');
