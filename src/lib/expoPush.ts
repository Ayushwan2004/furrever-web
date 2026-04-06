// src/lib/expoPush.ts — SERVER SIDE ONLY
// Sends push notifications via Expo Push API from Next.js API routes

export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

// Send to one or many tokens
export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (!messages.length) return [];

  // Filter out clearly invalid tokens
  const valid = messages.filter(m => {
    const tokens = Array.isArray(m.to) ? m.to : [m.to];
    return tokens.some(t => t && t.startsWith('ExponentPushToken'));
  });

  if (!valid.length) return [];

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valid.length === 1 ? valid[0] : valid),
    });

    const data = await res.json();
    // Expo returns { data: ticket } for single, { data: [tickets] } for batch
    return Array.isArray(data.data) ? data.data : [data.data];
  } catch (error) {
    console.error('[ExpoPush] Send error:', error);
    return [];
  }
}

// Convenience: send a single push to one token
export async function sendSinglePush(
  token: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> {
  if (!token?.startsWith('ExponentPushToken')) return;
  await sendExpoPush([{
    to: token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
    channelId: 'default',
  }]);
}

// Send to all users (batch, max 100 per Expo request)
export async function sendBulkPush(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> {
  const validTokens = tokens.filter(t => t?.startsWith('ExponentPushToken'));
  if (!validTokens.length) return;

  // Expo allows max 100 messages per request
  const CHUNK = 100;
  for (let i = 0; i < validTokens.length; i += CHUNK) {
    const chunk = validTokens.slice(i, i + CHUNK);
    await sendExpoPush(chunk.map(to => ({
      to,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    })));
  }
}