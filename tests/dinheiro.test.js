import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { paraCentavos, deCentavos, calcularValorItemCentavos } from '../src/utils/dinheiro.js';

describe('paraCentavos', () => {
  it('converte reais em centavos inteiros', () => {
    assert.equal(paraCentavos(1499), 149900);
    assert.equal(paraCentavos(0.1), 10);
    assert.equal(paraCentavos(0), 0);
  });

  it('corrige o resíduo do ponto flutuante', () => {
    // 19.99 * 100 dá 1998.9999999999998 em IEEE 754
    assert.equal(paraCentavos(19.99), 1999);
  });

  it('rejeita o que não é número', () => {
    assert.throws(() => paraCentavos('1499'), TypeError);
    assert.throws(() => paraCentavos(undefined), TypeError);
    assert.throws(() => paraCentavos(NaN), TypeError);
  });
});

describe('deCentavos', () => {
  it('converte centavos de volta para reais', () => {
    assert.equal(deCentavos(149900), 1499);
    assert.equal(deCentavos(1999), 19.99);
  });

  it('resolve o caso clássico 0.1 + 0.2', () => {
    assert.notEqual(0.1 + 0.2, 0.3); // o problema
    assert.equal(deCentavos(paraCentavos(0.1) + paraCentavos(0.2)), 0.3); // a solução
  });
});

describe('calcularValorItemCentavos', () => {
  it('multiplica quantidade pelo preço unitário', () => {
    assert.equal(calcularValorItemCentavos(299, 6), 179400);
    assert.equal(calcularValorItemCentavos(1499, 1.0), 149900); // a API manda 1.0
  });

  it('soma os itens do pedido 10 em R$ 4.487,00', () => {
    const itens = [
      calcularValorItemCentavos(1499, 1), // MESA NARA REDONDA
      calcularValorItemCentavos(299, 6), // ARANDELA SAPHIRA
      calcularValorItemCentavos(199, 6), // CADEIRA VENEZA
    ];
    const total = itens.reduce((soma, valor) => soma + valor, 0);
    assert.equal(deCentavos(total), 4487);
  });

  it('rejeita quantidade que não é número', () => {
    assert.throws(() => calcularValorItemCentavos(1499, undefined), TypeError);
  });
});
