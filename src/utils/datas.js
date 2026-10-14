// Converte a data da API ("DD-MM-AAAA") para ISO ("AAAA-MM-DD").
// É manual porque new Date("02-06-2000") entende 6 de fevereiro.

// DD-MM-AAAA, capturando dia, mês e ano.
const FORMATO_LIFT = /^(\d{2})-(\d{2})-(\d{4})$/;

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Divisível por 4, exceto séculos não divisíveis por 400 (2000 foi bissexto, 1900 não).
function ehBissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

function diasNoMes(mes, ano) {
  return mes === 2 && ehBissexto(ano) ? 29 : DIAS_POR_MES[mes - 1];
}

// "29-01-2000" -> "2000-01-29". Devolve null para formato inválido ou data que
// não existe, como o "00-00-0000" que a API usa para pedido inexistente.
export function converterDataLift(texto) {
  if (typeof texto !== 'string') return null;

  const partes = FORMATO_LIFT.exec(texto);
  if (!partes) return null;

  const [, diaTexto, mesTexto, anoTexto] = partes;
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);

  if (ano < 1 || mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > diasNoMes(mes, ano)) return null;

  return `${anoTexto}-${mesTexto}-${diaTexto}`;
}
