import { Message, UserProfile } from '../types';

export interface StreamChatParams {
  message?: string;
  image?: { mimeType: string; data: string };
  history: Message[];
  userProfile: UserProfile;
  isFirstMessage?: boolean;
  onPartialBalloons: (balloons: string[]) => void;
  onChips: (chips: string[]) => void;
}

export function getDeviceContext() {
  const now = new Date();
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dayOfWeek = dayNames[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const deviceTime = `${hours}:${minutes}`;
  const fullDate = now.toLocaleDateString('pt-BR');

  return { dayOfWeek, deviceTime, fullDate };
}

export async function streamHelenaChat({
  message,
  image,
  history,
  userProfile,
  isFirstMessage = false,
  onPartialBalloons,
  onChips,
}: StreamChatParams): Promise<{ balloons: string[]; chips: string[] }> {
  const context = getDeviceContext();

  const makeRequest = async () => {
    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        image,
        history,
        userProfile,
        context,
        isFirstMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No readable stream body returned');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.chunk) {
            accumulatedText += parsed.chunk;

            // Process text so far
            const { cleanText, chips } = extractChips(accumulatedText);
            const balloons = cleanText
              .split(/\n\n+/)
              .map((b) => b.trim())
              .filter((b) => b.length > 0);

            if (balloons.length > 0) {
              onPartialBalloons(balloons);
            }
            if (chips.length > 0) {
              onChips(chips);
            }
          }
        } catch (e: any) {
          if (e.message && e.message !== 'Unexpected end of JSON input') {
            console.warn('SSE parsing warning:', e.message);
          }
        }
      }
    }

    const { cleanText, chips } = extractChips(accumulatedText);
    const finalBalloons = cleanText
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    return {
      balloons: finalBalloons.length > 0 ? finalBalloons : [cleanText.trim() || 'Estou aqui com você!'],
      chips,
    };
  };

  // Automatic retry rule: 1 retry before reporting error bubble
  try {
    return await makeRequest();
  } catch (err1) {
    console.warn('Chat stream attempt 1 failed, retrying once...', err1);
    try {
      return await makeRequest();
    } catch (err2) {
      console.error('Chat stream attempt 2 failed:', err2);
      throw new Error('Deu uma falha aqui, me manda de novo?');
    }
  }
}

// Background memory updater trigger
export async function triggerBackgroundMemoryUpdate(
  recentMessages: Message[],
  currentProfile: UserProfile,
  onProfileUpdated: (updatedProfile: UserProfile) => void
) {
  try {
    const res = await fetch('/api/memory-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recentMessages: recentMessages.slice(-10),
        currentProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.updated && data.memory) {
        const mem = data.memory;
        const newNotes = Array.isArray(mem.newNotes) ? mem.newNotes : [];
        const combinedNotes = Array.from(new Set([...(currentProfile.memoryNotes || []), ...newNotes]));

        const updated: UserProfile = {
          ...currentProfile,
          name: mem.name?.trim() ? mem.name.trim() : currentProfile.name,
          triggers: mem.triggers || currentProfile.triggers,
          conditions: mem.conditions || currentProfile.conditions,
          memoryNotes: combinedNotes,
          summary: mem.summaryDelta ? `${currentProfile.summary} ${mem.summaryDelta}`.trim() : currentProfile.summary,
        };
        onProfileUpdated(updated);
      }
    }
  } catch (e) {
    // Non-blocking background fail
  }
}

// Proactive check-in trigger
export async function fetchProactiveCheckin(
  userProfile: UserProfile,
  hoursAway: number
): Promise<{ balloons: string[]; chips: string[] }> {
  const context = getDeviceContext();
  const res = await fetch('/api/proactive-checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userProfile,
      context,
      hoursAway,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed checkin');
  }

  const data = await res.json();
  const rawText = data.text || '';
  const { cleanText, chips } = extractChips(rawText);
  const balloons = cleanText
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return {
    balloons: balloons.length > 0 ? balloons : [cleanText.trim()],
    chips,
  };
}

export function extractChips(text: string): { cleanText: string; chips: string[] } {
  const marker = '###CHIPS###';
  const idx = text.indexOf(marker);
  if (idx === -1) {
    return { cleanText: text, chips: [] };
  }

  const cleanText = text.substring(0, idx).trimEnd();
  const chipsPart = text.substring(idx + marker.length).trim();

  let chips: string[] = [];
  try {
    const parsed = JSON.parse(chipsPart);
    if (Array.isArray(parsed)) {
      chips = parsed.map((c) => String(c).trim()).filter((c) => c.length > 0 && c.length < 50);
    }
  } catch {
    // Partial parse if in streaming
    const match = chipsPart.match(/\[(.*?)\]/);
    if (match) {
      try {
        const parsed = JSON.parse(`[${match[1]}]`);
        if (Array.isArray(parsed)) {
          chips = parsed.map((c) => String(c).trim());
        }
      } catch {}
    }
  }

  return { cleanText, chips };
}

export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
