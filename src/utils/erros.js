// Erros da aplicação. Cada um já carrega o seu status HTTP, e o segundo
// parâmetro aceita { cause } para guardar o erro original.

export class ErroAplicacao extends Error {
  constructor(mensagem, status, opcoes) {
    super(mensagem, opcoes);
    this.name = this.constructor.name;
    this.status = status;
  }
}

// 400: o cliente mandou algo inválido (ex.: id "abc").
export class ErroRequisicaoInvalida extends ErroAplicacao {
  constructor(mensagem, opcoes) {
    super(mensagem, 400, opcoes);
  }
}

// 404: o pedido não existe (a API Lift devolve o sentinela id 0).
export class ErroNaoEncontrado extends ErroAplicacao {
  constructor(mensagem, opcoes) {
    super(mensagem, 404, opcoes);
  }
}

// 502: a API Lift falhou, demorou demais ou devolveu dados inconsistentes.
export class ErroApiLift extends ErroAplicacao {
  constructor(mensagem, opcoes) {
    super(mensagem, 502, opcoes);
  }
}
