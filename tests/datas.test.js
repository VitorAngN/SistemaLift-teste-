import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { converterDataLift } from '../src/utils/datas.js';
import { pedidos } from './fixtures.js';

describe('converterDataLift', () => {
  it('converte DD-MM-AAAA para AAAA-MM-DD', () => {
    assert.equal(converterDataLift('29-01-2000'), '2000-01-29');
    assert.equal(converterDataLift('02-06-2000'), '2000-06-02');
  });

  it('converte todas as datas reais da API', () => {
    for (const pedido of pedidos) {
      assert.match(converterDataLift(pedido.data), /^\d{4}-\d{2}-\d{2}$/, `pedido ${pedido.id}`);
    }
  });

  it('devolve null para o sentinela de pedido inexistente', () => {
    assert.equal(converterDataLift('00-00-0000'), null);
  });

  it('devolve null para datas que não existem', () => {
    assert.equal(converterDataLift('31-02-2000'), null); // fevereiro
    assert.equal(converterDataLift('31-04-2000'), null); // abril tem 30 dias
    assert.equal(converterDataLift('32-01-2000'), null);
    assert.equal(converterDataLift('00-01-2000'), null);
    assert.equal(converterDataLift('01-13-2000'), null);
  });

  it('respeita os anos bissextos', () => {
    assert.equal(converterDataLift('29-02-2024'), '2024-02-29'); // divisível por 4
    assert.equal(converterDataLift('29-02-2023'), null);
    assert.equal(converterDataLift('29-02-2000'), '2000-02-29'); // século divisível por 400
    assert.equal(converterDataLift('29-02-1900'), null); // século não divisível por 400
  });

  it('devolve null para formatos diferentes de DD-MM-AAAA', () => {
    assert.equal(converterDataLift('2000-01-29'), null);
    assert.equal(converterDataLift('29/01/2000'), null);
    assert.equal(converterDataLift('1-1-2000'), null);
    assert.equal(converterDataLift(' 29-01-2000'), null);
    assert.equal(converterDataLift(''), null);
  });

  it('devolve null quando não recebe texto', () => {
    assert.equal(converterDataLift(undefined), null);
    assert.equal(converterDataLift(null), null);
    assert.equal(converterDataLift(29012000), null);
  });
});
