import 'dotenv/config';

export interface Program {
  id: string;
  name?: string;
}

export interface DeleteResult {
  uuid: string;
  status: number;
  ok: boolean;
  message: string;
}

function getConfig(): { baseUrl: string; token: string } {
  const token = process.env.DIDAXIS_API_TOKEN;
  if (!token) {
    throw new Error('Set DIDAXIS_API_TOKEN in .env (run from the project root).');
  }
  const baseUrl = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
  return { baseUrl, token };
}

/** Fetch every program via GET /api/programs and return their UUIDs (and names). */
export async function fetchPrograms(): Promise<Program[]> {
  const { baseUrl, token } = getConfig();

  const response = await fetch(`${baseUrl}/api/programs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) {
      throw new Error(`GET /api/programs returned 401 — verify DIDAXIS_API_TOKEN in .env. ${body}`);
    }
    throw new Error(`GET /api/programs failed: ${response.status} ${body}`);
  }

  const body = (await response.json()) as { data?: Program[] };
  return body.data ?? [];
}

/** Delete a single program via DELETE /api/programs/<uuid>. Never throws; returns a result. */
export async function deleteProgram(uuid: string): Promise<DeleteResult> {
  const { baseUrl, token } = getConfig();

  const response = await fetch(`${baseUrl}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  const text = await response.text();
  let message = text;
  try {
    const parsed = JSON.parse(text) as { message?: string };
    message = parsed.message ?? text;
  } catch {
    // non-JSON body; keep raw text
  }

  if (response.status === 404) {
    message = message || 'Program already removed (404)';
  }

  return {
    uuid,
    status: response.status,
    ok: response.ok,
    message,
  };
}
