// Erros da aplicação. Cada classe já carrega o status HTTP que representa,
// assim o middleware de erro (Etapa 3) só precisa ler erro.status.
//
// O segundo parâmetro aceita { cause: erroOriginal }, para não perder
// o erro que deu origem a este (ex.: o timeout do fetch).

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
