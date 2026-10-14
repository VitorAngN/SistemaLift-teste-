import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatarMoeda, formatarData, formatarQuantidade } from '../public/js/formatar.js';

// O Intl separa "R$" do número com um espaço que não quebra linha (U+00A0).
const R$ = 'R$ ';

describe('formatarMoeda', () => {
  it('formata em reais no padrão brasileiro', () => {
    assert.equal(formatarMoeda(4487), `${R$}4.487,00`);
    assert.equal(formatarMoeda(82297), `${R$}82.297,00`);
    assert.equal(formatarMoeda(19.9), `${R$}19,90`);
    assert.equal(formatarMoeda(0), `${R$}0,00`);
  });
});

describe('formatarData', () => {
  it('converte a data ISO para DD/MM/AAAA', () => {
    assert.equal(formatarData('2000-06-02'), '02/06/2000');
    assert.equal(formatarData('2000-12-01'), '01/12/2000');
  });
});

describe('formatarQuantidade', () => {
  it('mostra inteiros sem casas decimais e decimais com vírgula', () => {
    assert.equal(formatarQuantidade(6), '6');
    assert.equal(formatarQuantidade(1.5), '1,5');
  });
});
