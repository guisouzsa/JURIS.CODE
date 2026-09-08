"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { GoogleGenAI, ThinkingLevel, type Content, type Part } from "@google/genai";
import { authOptions } from "@/app/lib/auth";
import { ASSISTANT_TOOLS, runAssistantTool } from "./tools";

export type ChatMessage = { role: "user" | "assistant"; text: string };
export type AssistantResult = { reply: string } | { error: string };

const MODEL = "gemini-3.6-flash";
const MAX_TOOL_ROUNDS = 6;

function buildSystemInstruction(): string {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return [
    "Você é o assistente jurídico do JURIS.CODE, um sistema de gestão para escritórios de advocacia.",
    `Hoje é ${today}.`,
    "Responda em português do Brasil, de forma direta e objetiva.",
    "Use as ferramentas disponíveis para consultar dados reais de clientes, processos, tarefas e agenda antes de responder — nunca invente números ou informações.",
    "Quando não houver dados suficientes para responder, diga isso claramente em vez de supor.",
  ].join("\n");
}

export async function askAssistant(history: ChatMessage[]): Promise<AssistantResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = session.user.id;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "O assistente ainda não foi configurado (faltando a variável GEMINI_API_KEY)." };
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents: Content[] = history.map((message) => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.text }],
  }));

  const config = {
    systemInstruction: buildSystemInstruction(),
    tools: [{ functionDeclarations: ASSISTANT_TOOLS }],
    // As perguntas são curtas e as ferramentas já são bem descritas — não precisa de raciocínio
    // extenso. Isso corta bastante latência e custo sem perder a escolha certa da ferramenta.
    thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
  };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    let response;
    try {
      response = await ai.models.generateContent({ model: MODEL, contents, config });
    } catch (error) {
      console.error("Erro ao chamar o Gemini:", error);
      return { error: "Não foi possível falar com o assistente agora. Tente novamente em instantes." };
    }

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) {
      return { reply: response.text ?? "Não consegui gerar uma resposta." };
    }

    const modelTurn = response.candidates?.[0]?.content ?? {
      role: "model",
      parts: calls.map((call) => ({ functionCall: call })),
    };
    contents.push(modelTurn);

    const responseParts: Part[] = await Promise.all(
      calls.map(async (call) => {
        const toolName = call.name ?? "";
        try {
          const output = await runAssistantTool(userId, toolName, call.args ?? {});
          return { functionResponse: { name: toolName, response: { output } } };
        } catch (error) {
          return {
            functionResponse: {
              name: toolName,
              response: { error: error instanceof Error ? error.message : "Erro ao executar a ferramenta." },
            },
          };
        }
      })
    );

    contents.push({ role: "user", parts: responseParts });
  }

  return { error: "O assistente não conseguiu concluir a resposta. Tente reformular a pergunta." };
}
