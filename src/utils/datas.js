// Conversão da data que a API Lift envia ("DD-MM-AAAA") para o formato ISO ("AAAA-MM-DD").
//
// A conversão é manual de propósito: new Date("02-06-2000") interpreta o texto
// como mês-dia (6 de fevereiro) e new Date("30-10-2000") vira Invalid Date.

// Expressão regular: exatamente 2 dígitos, hífen, 2 dígitos, hífen, 4 dígitos.
// Os parênteses "capturam" dia, mês e ano para usarmos depois.
const FORMATO_LIFT = /^(\d{2})-(\d{2})-(\d{4})$/;

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Regra do calendário gregoriano: divisível por 4, exceto os séculos,
// que só são bissextos se divisíveis por 400 (2000 foi, 1900 não).
function ehBissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

function diasNoMes(mes, ano) {
  return mes === 2 && ehBissexto(ano) ? 29 : DIAS_POR_MES[mes - 1];
}

// Recebe "29-01-2000" e devolve "2000-01-29".
// Devolve null se o texto não estiver no formato ou se a data não existir
// (inclui o sentinela "00-00-0000" que a API usa para pedido inexistente).
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
