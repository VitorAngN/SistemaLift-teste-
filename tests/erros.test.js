import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroNaoEncontrado,
  ErroApiLift,
} from '../src/utils/erros.js';

describe('classes de erro', () => {
  const casos = [
    { Classe: ErroRequisicaoInvalida, status: 400 },
    { Classe: ErroNaoEncontrado, status: 404 },
    { Classe: ErroApiLift, status: 502 },
  ];

  for (const { Classe, status } of casos) {
    it(`${Classe.name} carrega o status ${status}`, () => {
      const erro = new Classe('mensagem de teste');

      assert.equal(erro.status, status);
      assert.equal(erro.message, 'mensagem de teste');
      assert.equal(erro.name, Classe.name);
      assert.ok(erro instanceof ErroAplicacao);
      assert.ok(erro instanceof Error);
    });
  }

  it('guarda o erro original em cause', () => {
    const original = new Error('timeout');
    const erro = new ErroApiLift('A API Lift não respondeu', { cause: original });

    assert.equal(erro.cause, original);
  });
});
