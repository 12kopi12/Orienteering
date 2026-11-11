import {
  Race,
  RaceStatus,
  Category,
  Competitor,
  RaceEntry,
  RaceResultsResponse,
  User,
} from './types';

const TOKEN_KEY = 'orienteering_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Chyba při komunikaci se serverem (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
      const res = await request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      return res;
    },
    me: (): Promise<{ user: User }> => request<{ user: User }>('/api/auth/me'),
    logout: (): void => {
      removeToken();
    },
  },

  races: {
    list: (): Promise<Race[]> => request<Race[]>('/api/races'),
    get: (id: number): Promise<Race> => request<Race>(`/api/races/${id}`),
    create: (data: Partial<Race>): Promise<Race> =>
      request<Race>('/api/races', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Race>): Promise<Race> =>
      request<Race>(`/api/races/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: RaceStatus): Promise<Race> =>
      request<Race>(`/api/races/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    delete: (id: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/races/${id}`, {
        method: 'DELETE',
      }),
  },

  categories: {
    create: (
      raceId: number,
      data: { name: string; distance_km?: number | null; elevation_m?: number | null }
    ): Promise<Category> =>
      request<Category>(`/api/races/${raceId}/categories`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: { name?: string; distance_km?: number | null; elevation_m?: number | null }
    ): Promise<Category> =>
      request<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  competitors: {
    list: (search = ''): Promise<Competitor[]> =>
      request<Competitor[]>(`/api/competitors${search ? `?q=${encodeURIComponent(search)}` : ''}`),
    create: (data: {
      first_name: string;
      last_name: string;
      club?: string | null;
      reg_number?: string | null;
    }): Promise<Competitor> =>
      request<Competitor>('/api/competitors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: { first_name?: string; last_name?: string; club?: string | null; reg_number?: string | null }
    ): Promise<Competitor> =>
      request<Competitor>(`/api/competitors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/competitors/${id}`, {
        method: 'DELETE',
      }),
  },

  entries: {
    list: (categoryId: number): Promise<RaceEntry[]> =>
      request<RaceEntry[]>(`/api/categories/${categoryId}/entries`),
    create: (
      categoryId: number,
      data: {
        competitor_id?: number;
        first_name?: string;
        last_name?: string;
        club?: string;
        reg_number?: string;
        bib_number?: number;
        note?: string;
      }
    ): Promise<RaceEntry> =>
      request<RaceEntry>(`/api/categories/${categoryId}/entries`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    start: (id: number, started_at?: string): Promise<RaceEntry> =>
      request<RaceEntry>(`/api/entries/${id}/start`, {
        method: 'POST',
        body: JSON.stringify({ started_at }),
      }),
    finish: (id: number, finished_at?: string, result_time_seconds?: number): Promise<RaceEntry> =>
      request<RaceEntry>(`/api/entries/${id}/finish`, {
        method: 'POST',
        body: JSON.stringify({ finished_at, result_time_seconds }),
      }),
    update: (id: number, data: Partial<RaceEntry> & { result_time?: string }): Promise<RaceEntry> =>
      request<RaceEntry>(`/api/entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<{ message: string }> =>
      request<{ message: string }>(`/api/entries/${id}`, {
        method: 'DELETE',
      }),
  },

  results: {
    get: (raceId: number): Promise<RaceResultsResponse> =>
      request<RaceResultsResponse>(`/api/races/${raceId}/results`),
  },
};
