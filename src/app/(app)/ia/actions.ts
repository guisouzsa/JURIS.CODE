"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "groq-sdk/resources/chat/completions";
import { authOptions } from "@/app/lib/auth";
import { ASSISTANT_TOOLS, runAssistantTool } from "./tools";

export type ChatMessage = { role: "user" | "assistant"; text: string };
export type AssistantResult = { reply: string } | { error: string };

const MODEL = "openai/gpt-oss-20b";
const MAX_TOOL_ROUNDS = 6;

function buildSystemPrompt(pageContext?: string): string {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return [
    "Você é o assistente jurídico do JURIS.CODE, um sistema de gestão para escritórios de advocacia.",
    `Hoje é ${today}.`,
    ...(pageContext ? [`Contexto atual: o usuário está navegando em "${pageContext}". Use isso apenas como pista de intenção — se a pergunta for genérica, ainda assim prefira confirmar a que registro específico ele se refere em vez de supor.`] : []),
    "Responda em português do Brasil, de forma direta e objetiva.",
    "Use as ferramentas disponíveis para consultar dados reais de clientes, processos, tarefas e agenda antes de responder — nunca invente números, nomes ou informações.",
    "As ferramentas já retornam rótulos amigáveis (ex.: 'Ativo', 'Criminal') e 'Não informado' para campos vazios — repasse esses valores como estão, não troque por outra coisa.",
    "Quando um dado não existir (sem número de processo, sem prazo, etc.), diga isso explicitamente (ex.: 'Sem número informado') em vez de inventar ou omitir.",
    "",
    "Escopo: você só deve tratar de assuntos ligados ao JURIS.CODE (clientes, processos, tarefas, agenda) e à rotina de um escritório de advocacia em geral (dúvidas de prática jurídica, organização do trabalho, etc.).",
    "Cumprimentos e conversa social breve (bom dia, tudo bem, obrigado) são sempre permitidos.",
    "Se o pedido não tiver relação nenhuma com isso (ex.: programação, receitas, entretenimento, temas gerais sem ligação com direito ou com o escritório), recuse educadamente em uma frase e explique que você é focado em ajudar com a rotina jurídica do usuário no JURIS.CODE.",
    "",
    "Perguntas amplas (ex.: 'o que eu tenho cadastrado', 'me dá um resumo geral', 'como está tudo'): chame get_overview_stats primeiro. Se os números forem pequenos (poucas dezenas no total), pode detalhar direto chamando list_clients, list_processes e list_tasks e mostrando por categoria. Se os números forem grandes, mostre só o resumo de contagens e pergunte qual categoria o usuário quer ver em detalhe — não liste centenas de registros de uma vez.",
    "Se o usuário disser literalmente 'liste tudo' ou 'mostre todos os registros' com um total grande, não tente listar tudo numa resposta só: mostre a contagem total por categoria e peça para ele escolher uma categoria por vez.",
    "Perguntas quantitativas agrupadas (ex.: 'quantos processos por área', 'quantos clientes por status'): use get_breakdown em vez de listar os registros individuais.",
    "Perguntas sobre um cliente específico pelo nome (ex.: 'processos da Mariana', 'tudo sobre o Carlos Almeida'): use get_client_details, não list_processes/list_tasks separadamente. Se a ferramenta retornar 'ambiguo: true', pergunte ao usuário qual das opções listadas ele quer antes de continuar — nunca escolha por conta própria.",
    "Perguntas sobre um processo específico (ex.: 'tarefas do processo 004821'): use get_process_details da mesma forma, respeitando a mesma regra de desambiguação.",
    "Se o usuário pedir mais resultados depois de uma lista ('mostra mais', 'próxima página'), chame a mesma ferramenta de novo aumentando o parâmetro 'page'.",
    "Para perguntas com datas relativas ('esta semana', 'sexta-feira', 'daqui a 10 dias'), calcule as datas exatas você mesmo a partir da data de hoje informada acima e passe 'from'/'to' para get_agenda — não peça para o usuário informar a data.",
    "",
    "Formatação da resposta (markdown é renderizado no chat):",
    "- Para perguntas simples ('o que tenho cadastrado', 'quantos clientes tenho'), responda de forma curta e natural: um resumo em negrito/lista, não uma tabela.",
    "- Use tabelas em markdown apenas quando o usuário pedir uma comparação ou listagem tabular explicitamente, ou quando os dados tiverem muitas colunas relevantes ao mesmo tempo.",
    "- Quando houver várias categorias (clientes, processos, tarefas, agenda), separe com um pequeno título em negrito por categoria, com contagem e uma lista curta de itens.",
    "- Se a ferramenta retornar mais itens do que os exibidos (campo 'total' maior que 'mostrando'), diga quantos existem no total e pergunte se o usuário quer ver todos.",
    "- Não escreva respostas longas demais. Priorize clareza e facilidade de leitura rápida.",
    "- Perguntas de sim/não ou de contagem única (ex.: 'tenho tarefas atrasadas?', 'qual meu próximo compromisso?') merecem uma resposta de uma frase, sem listas — ofereça detalhar depois, só se fizer sentido ('Quer que eu liste?').",
    "",
    "Segurança e limites: você é somente consultivo. Você não tem — e não deve fingir ter — a capacidade de criar, editar ou excluir clientes, processos, tarefas ou compromissos.",
    "Se o usuário pedir uma ação desse tipo (ex.: 'agende uma reunião', 'crie uma tarefa'), explique que ainda não pode executar isso diretamente e oriente a fazer pela tela correspondente (Clientes, Processos, Tarefas ou Agenda). Não finja ter executado a ação.",
  ].join("\n");
}

const TOOLS: ChatCompletionTool[] = ASSISTANT_TOOLS.map((tool) => ({
  type: "function",
  function: { name: tool.name, description: tool.description, parameters: tool.parameters },
}));

export async function askAssistant(history: ChatMessage[], pageContext?: string): Promise<AssistantResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = session.user.id;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: "O assistente ainda não foi configurado (faltando a variável GROQ_API_KEY)." };
  }

  const groq = new Groq({ apiKey, maxRetries: 3 });

  const messages: ChatCompletionMessageParam[] = [{ role: "system", content: buildSystemPrompt(pageContext) }];
  for (const message of history) {
    messages.push(
      message.role === "user"
        ? { role: "user", content: message.text }
        : { role: "assistant", content: message.text }
    );
  }

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    let response;
    try {
      response = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        reasoning_effort: "low",
      });
    } catch (error) {
      console.error("Erro ao chamar o Groq:", error);
      if (error instanceof Groq.APIError && (error.status === 429 || error.status === 503)) {
        return { error: "O assistente está sobrecarregado no momento. Tente novamente em alguns segundos." };
      }
      return { error: "Não foi possível falar com o assistente agora. Tente novamente em instantes." };
    }

    const message = response.choices[0]?.message;
    if (!message) {
      return { error: "Não consegui gerar uma resposta." };
    }

    const toolCalls = message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return { reply: message.content ?? "Não consegui gerar uma resposta." };
    }

    messages.push({ role: "assistant", content: message.content, tool_calls: toolCalls });

    for (const call of toolCalls) {
      let output: unknown;
      try {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        output = await runAssistantTool(userId, call.function.name, args);
      } catch (error) {
        output = { error: error instanceof Error ? error.message : "Erro ao executar a ferramenta." };
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
    }
  }

  return { error: "O assistente não conseguiu concluir a resposta. Tente reformular a pergunta." };
}
