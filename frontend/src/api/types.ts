export interface User {
  id: number;
  username: string;
  created_at?: string;
}

export type RaceStatus = 'DRAFT' | 'IN_PROGRESS' | 'FINISHED';

export interface Category {
  id: number;
  race_id: number;
  name: string;
  distance_km?: number | null;
  elevation_m?: number | null;
  entry_count?: number;
}

export interface Race {
  id: number;
  name: string;
  location?: string | null;
  event_date?: string | null;
  status: RaceStatus;
  description?: string | null;
  created_at?: string | null;
  category_count?: number;
  categories?: Category[];
}

export interface Competitor {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  club?: string | null;
  reg_number?: string | null;
  created_at?: string | null;
}

export type EntryStatus = 'REGISTERED' | 'RUNNING' | 'FINISHED' | 'DNF' | 'DISQ' | 'DNS';

export interface RaceEntry {
  id: number;
  category_id: number;
  competitor_id: number;
  competitor?: Competitor;
  bib_number?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
  result_time_seconds?: number | null;
  result_time_formatted?: string | null;
  status: EntryStatus;
  note?: string | null;
}

export interface EntryResultItem {
  rank: number | null;
  bib_number: number | null;
  competitor: Competitor | null;
  result_time_seconds: number | null;
  result_time_formatted: string | null;
  gap: string | null;
  gap_seconds: number | null;
  status: EntryStatus;
  note: string | null;
}

export interface CategoryResults {
  category: Category;
  total_participants: number;
  finishers_count: number;
  results: EntryResultItem[];
}

export interface RaceResultsResponse {
  race: Race;
  categories: CategoryResults[];
}
