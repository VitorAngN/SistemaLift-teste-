// Os cálculos de dinheiro são feitos em centavos inteiros: em ponto flutuante,
// 0.1 + 0.2 dá 0.30000000000000004, e inteiros não têm esse erro.

function exigirNumero(valor, nome) {
  if (!Number.isFinite(valor)) {
    throw new TypeError(`${nome} deve ser um número, recebido: ${valor}`);
  }
}

// 1499 -> 149900. O Math.round corrige casos como 19.99 * 100 = 1998.9999999999998.
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
