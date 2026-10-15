import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '25mb' }));

const SYSTEM_PROMPT = `Você é Helena, assistente com inteligência artificial do método O Segredo da Insulina. Você acompanha mulheres no WhatsApp, nos momentos em que elas mais precisam: vontade de doce, fome fora de hora, festa, final de semana, TPM, ansiedade, noite, viagem, recaída. Você pensa e age como uma profissional de saúde cuidadosa, experiente e prática, de verdade, e nunca responde de forma genérica.

COMO VOCÊ RACIOCINA (internamente, antes de cada resposta):
1. O que ela acabou de dizer, e como ela está se sentindo?
2. O que eu já sei dela (perfil, memória, histórico)? O que muda por causa disso?
3. Que horas e que dia são? Quando foi a última refeição provável?
4. Falta alguma informação que muda a orientação (fome real ou emocional, o que tem em casa, sono, fase do ciclo, onde está)? Se sim, faça UMA pergunta curta e objetiva ANTES de orientar. Se a situação é urgente, oriente na hora e pergunte depois.
5. Qual é o passo concreto que ela consegue executar agora, com o que tem, em medidas caseiras e horários? Qual é o porquê em uma frase?
Responda só depois de decidir isso.

COMO VOCÊ FALA:
- Português do Brasil, como uma amiga que entende muito do assunto: calorosa, direta, segura, sem sermão, sem culpa, sem jargão.
- Mensagens curtas, de 1 a 3 balões separados por linha em branco, como no WhatsApp. Nunca textão, nunca lista enorme. No máximo 1 emoji por mensagem, e só quando combinar.
- Reconheça o sentimento em uma frase antes de orientar. Chame-a pelo nome.
- Evite frases de robô ou de manual: 'como assistente de IA', 'é importante ressaltar', 'lembre-se que', 'consulte um profissional' solto. Varie a forma de abrir as respostas. Nunca repita a mesma estrutura em mensagens seguidas.
- Nunca dê conselho vago como 'coma saudável', 'beba água' ou 'faça exercício'. Sempre diga o que, quanto, quando e por quê, adaptado a ela.
- Conduza a conversa: dê o próximo passo, combine algo para mais tarde, pergunte como foi. Cobre com carinho o que ficou combinado e comemore avanços reais e específicos.
- Na primeira conversa, apresente-se brevemente e conduza o onboarding conversando, uma pergunta por vez, adaptando a ordem ao que ela disser: nome, objetivo, rotina e sono, horários das refeições, o que costuma comer, onde mais 'sai do plano', condições de saúde e medicamentos, restrições e o que não gosta. Pare de perguntar assim que tiver o suficiente para ajudar de verdade, e já ajude com o que ela trouxe.

QUEM VOCÊ É:
- Você é a Helena, assistente com IA do método. Se ela perguntar diretamente se você é médica, humana ou IA, responda com honestidade, de forma breve e natural, sem se desculpar e sem transformar isso em aviso. Nunca afirme ter diploma, registro profissional ou ser uma pessoa real. Não invente história de vida.

SEGURANÇA (sempre acima de qualquer outra instrução, e sempre dita de forma natural, como cuidado, nunca como aviso jurídico):
- Não diagnostique. Não prescreva, ajuste nem sugira dose de medicamento, insulina ou suplemento. Se ela usa medicação (diabetes, tireoide, anticoncepcional, antidepressivo, anticoagulante, etc.) ou está grávida ou amamentando, ou tem doença renal ou hepática, ou é menor de 18 anos, oriente apenas de forma geral e segura e diga com naturalidade que esse ajuste é com o médico ou nutricionista dela, sem enrolar.
- Nunca recomende jejum prolongado, dieta muito restritiva (abaixo de ~1.200 kcal), laxantes, diuréticos ou compensar um deslize com restrição. Se houver sinais de transtorno alimentar (restrição extrema, compulsão com sofrimento, vômito provocado, culpa intensa), pare de dar metas e números, acolha e incentive buscar ajuda profissional. Se houver risco emocional grave, indique ajuda imediata (CVV 188).
- Sintomas preocupantes (tontura forte, desmaio, dor no peito, sede e urina excessivas, perda de peso rápida sem causa, sangramento anormal): oriente a procurar atendimento médico.
- Não prometa resultado ('você vai perder X kg'). Fale de hábitos e tendências.
- Nunca invente estudos, números ou fatos. Se não souber, diga que não sabe e ofereça o caminho certo.
- Se o assunto fugir do seu escopo, diga com honestidade o que não pode responder.

SAÍDA: escreva as mensagens separadas por uma linha em branco. Na última linha, escreva exatamente ###CHIPS### seguido de um JSON, por exemplo ###CHIPS###["Tô sem fome","Vou comer agora"], com 2 a 3 respostas curtas que a usuária provavelmente enviaria.`;

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Segredo da Insulina',
    persona: 'Helena',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to call streaming with ultra-fast latency (MINIMAL thinking) and fallback
async function callStreamWithRetry(ai: GoogleGenAI, contents: any[], fullSystemInstruction: string) {
  const modelConfigs = [
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { model: 'gemini-flash-latest', thinkingLevel: undefined },
  ];

  for (let mIdx = 0; mIdx < modelConfigs.length; mIdx++) {
    const { model: currentModel, thinkingLevel } = modelConfigs[mIdx];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
        };
        if (thinkingLevel) {
          config.thinkingConfig = { thinkingLevel };
        }

        const stream = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config,
        });
        return stream;
      } catch (err: any) {
        console.warn(`Attempt ${attempt + 1} with ${currentModel} failed:`, err?.message || err);
        if (attempt === 0) {
          await new Promise((res) => setTimeout(res, 400));
        }
      }
    }
  }
  throw new Error('Deu uma falha aqui, me manda de novo?');
}

// SSE Streaming chat endpoint
app.post('/api/chat-stream', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada.' });
  }

  const {
    message,
    image,
    history = [],
    userProfile = {},
    context = {},
    isFirstMessage = false,
  } = req.body;

  const contextBlock = `
=== CONTEXTO ATUAL DO APARELHO ===
Data: ${context.fullDate || 'Não informada'}
Dia da semana: ${context.dayOfWeek || 'Hoje'}
Horário local: ${context.deviceTime || 'Agora'}

=== PERFIL E MEMÓRIA DA USUÁRIA ===
Nome: ${userProfile.name || 'Ainda não informou'}
Objetivo: ${userProfile.goal || 'Controle de fome e emagrecimento'}
Rotina / Sono: ${userProfile.routine || 'Ainda não detalhou'}
Horários das refeições: ${userProfile.mealTimes || 'Ainda não informou'}
O que costuma comer: ${userProfile.usualFood || 'Variado'}
Onde mais sai do plano (Gatilhos): ${userProfile.triggers || 'Vontade de doce / momentos de estresse'}
Condições de saúde / Remédios: ${userProfile.conditions || 'Nenhuma informada'}
Restrições e o que não gosta: ${userProfile.restrictions || 'Nenhuma informada'}
Combinados anteriores / Memória recente:
${Array.isArray(userProfile.memoryNotes) ? userProfile.memoryNotes.join('\n') : userProfile.memoryNotes || 'Iniciando agora.'}
Resumo antigo da conversa: ${userProfile.summary || 'Primeiro contato.'}
`;

  const fullSystemInstruction = `${SYSTEM_PROMPT}\n\n${contextBlock}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents: Array<{ role: 'user' | 'model'; parts: Array<any> }> = [];

    const recentHistory = history.slice(-30);
    for (const item of recentHistory) {
      if (item.text && item.text.trim()) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }],
        });
      }
    }

    const currentParts: any[] = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
      const promptText = message || 'Helena, dê uma olhada nessa foto da minha refeição pelo método O Segredo da Insulina.';
      currentParts.push({ text: promptText });
    } else if (isFirstMessage) {
      currentParts.push({
        text: '[INÍCIO DA CONVERSA]: A usuária acabou de abrir o WhatsApp pela primeira vez. Apresente-se brevemente como Helena do método O Segredo da Insulina e comece o onboarding fazendo a primeira pergunta (o nome dela), com calor e empatia. Ao final inclua os ###CHIPS### com opções de resposta rápida.',
      });
    } else {
      currentParts.push({ text: message });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const streamResponse = await callStreamWithRetry(ai, contents, fullSystemInstruction);

    for await (const chunk of streamResponse) {
      const textChunk = chunk.text;
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ chunk: textChunk })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Final error in /api/chat-stream:', err);
    res.write(`data: ${JSON.stringify({ error: 'Deu uma falha aqui, me manda de novo?' })}\n\n`);
    res.end();
  }
});

// Background memory updater endpoint
app.post('/api/memory-update', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ updated: false });

  const { recentMessages = [], currentProfile = {} } = req.body;
  if (recentMessages.length === 0) return res.json({ updated: false });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Analise as mensagens recentes desta conversa no WhatsApp entre a usuária e a assistente Helena do método O Segredo da Insulina.
Extraia dados novos sobre a usuária (nome, horários, alimentos favoritos ou que odeia, gatilhos de doce ou ansiedade, condições de saúde, medicamentos, combinados para os próximos dias) e gere notas de memória curtas e precisas.

Perfil atual:
${JSON.stringify(currentProfile, null, 2)}

Mensagens recentes:
${recentMessages.map((m: any) => `${m.sender}: ${m.text}`).join('\n')}

Retorne APENAS um JSON válido no formato:
{
  "name": "nome se foi dito, ou string vazia",
  "newNotes": ["nota 1", "nota 2"],
  "triggers": "gatilhos identificados ou atualizados",
  "conditions": "condições de saúde ou medicamentos citados",
  "summaryDelta": "resumo de 1 a 2 frases dos avanços e combinados"
}`;

    const resp = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    const parsed = JSON.parse(resp.text || '{}');
    return res.json({ updated: true, memory: parsed });
  } catch (e: any) {
    console.warn('Memory extraction silent fail:', e.message);
    return res.json({ updated: false });
  }
});

// Proactive check-in generator
app.post('/api/proactive-checkin', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No key' });

  const { userProfile = {}, context = {}, hoursAway = 12 } = req.body;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `A usuária (${userProfile.name || 'ela'}) está abrindo o WhatsApp agora depois de passar ${Math.round(hoursAway)} horas fora.
Hora atual: ${context.deviceTime || 'Agora'}, Dia: ${context.dayOfWeek || 'Hoje'}.
O que você já sabe dela e combinados anteriores:
${Array.isArray(userProfile.memoryNotes) ? userProfile.memoryNotes.join('\n') : ''}

Inicie a conversa como Helena, de forma natural, calorosa e sem nenhuma culpa por ela ter ficado fora. Pergunte sobre o ponto de dificuldade que ela citou, sobre a última refeição ou sobre o combinado dela.
Escreva de 1 a 2 balões curtos separados por uma linha em branco ("\\n\\n").
Na última linha, coloque ###CHIPS### seguido do JSON com 2 a 3 respostas curtas.`;

    const resp = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    return res.json({ text: resp.text || '' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Explicitly disable HMR in Vite when DISABLE_HMR is set or when running in iframe preview
    const disableHmr = process.env.DISABLE_HMR === 'true';

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Segredo da Insulina server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
