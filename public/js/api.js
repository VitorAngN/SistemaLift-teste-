// Chamadas do navegador para a nossa API (/api/...).

// Busca um JSON e, se a resposta for de erro, lança um Error com a mensagem
// que o servidor mandou em { "erro": "..." } e o status HTTP.
export async function buscarJson(caminho) {
  let resposta;
  try {
    resposta = await fetch(caminho);
  } catch {
    // O fetch só lança erro quando nem houve resposta (servidor fora do ar, sem rede).
    throw new Error('Não foi possível conectar ao servidor.');
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new Error(corpo?.erro ?? `Erro HTTP ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }

  return corpo;
}
