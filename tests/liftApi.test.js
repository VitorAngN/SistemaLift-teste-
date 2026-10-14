import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { ErroApiLift } from '../src/utils/erros.js';

// Servidor HTTP local que imita a Lift: testa o client sem depender da internet.
const lift = createServer((req, res) => {
  if (req.url === '/Pedidos/10') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ id: 10, cliente: 5, data: '02-06-2000' }));
  } else if (req.url === '/Pedidos/texto') {
    res.end('isto não é JSON');
  } else if (req.url === '/Pedidos/lento') {
    // nunca responde, para estourar o timeout
  } else {
    res.statusCode = 500;
    res.end();
  }
});

let liftApi;

before(async () => {
  lift.listen(0); // porta 0 = o sistema escolhe uma livre
  await once(lift, 'listening');

  // O config.js lê as variáveis de ambiente quando é importado,
  // então o client só é importado depois de configurá-las.
  process.env.LIFT_API_URL = `http://localhost:${lift.address().port}/`;
  process.env.LIFT_TIMEOUT_MS = '200';
  liftApi = await import('../src/clients/liftApi.js');
});

after(() => {
  lift.closeAllConnections();
  lift.close();
});

describe('liftApi (contra um servidor falso)', () => {
  it('devolve o JSON da resposta já como objeto', async () => {
    assert.deepEqual(await liftApi.buscarPedido(10), { id: 10, cliente: 5, data: '02-06-2000' });
  });

  it('transforma HTTP 500 em ErroApiLift (502)', async () => {
    await assert.rejects(liftApi.buscarPedido(1), (erro) => {
      assert.ok(erro instanceof ErroApiLift);
      assert.equal(erro.status, 502);
      assert.match(erro.message, /HTTP 500/);
      return true;
    });
  });

  it('transforma o timeout em ErroApiLift e guarda a causa', async () => {
    await assert.rejects(liftApi.buscarPedido('lento'), (erro) => {
      assert.ok(erro instanceof ErroApiLift);
      assert.match(erro.message, /não respondeu em 200 ms/);
      assert.equal(erro.cause.name, 'TimeoutError');
      return true;
    });
  });

  it('transforma uma resposta que não é JSON em ErroApiLift', async () => {
    await assert.rejects(liftApi.buscarPedido('texto'), ErroApiLift);
  });
});
