// Todo cálculo de dinheiro do projeto é feito em CENTAVOS INTEIROS.
//
// Motivo: o Number do JavaScript é ponto flutuante binário (IEEE 754) e não
// representa 0,10 exatamente: 0.1 + 0.2 resulta em 0.30000000000000004.
// Inteiros (até 2^53) são exatos, então somar centavos nunca acumula erro.
// A conversão para reais acontece só no final, para exibir.

function exigirNumero(valor, nome) {
  if (!Number.isFinite(valor)) {
    throw new TypeError(`${nome} deve ser um número, recebido: ${valor}`);
  }
}

// 1499 (reais) -> 149900 (centavos). Math.round corrige resíduos como 19.99 * 100 = 1998.9999999999998.
export function paraCentavos(valorEmReais) {
  exigirNumero(valorEmReais, 'valor');
  return Math.round(valorEmReais * 100);
}

// 149900 (centavos) -> 1499 (reais)
export function deCentavos(centavos) {
  exigirNumero(centavos, 'centavos');
  return centavos / 100;
}

// Valor de um item do pedido: quantidade × preço unitário, já em centavos.
export function calcularValorItemCentavos(valorUnitario, quantidade) {
  exigirNumero(quantidade, 'quantidade');
  return Math.round(paraCentavos(valorUnitario) * quantidade);
}
