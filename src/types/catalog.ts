export interface CatalogItem {
  id: number;
  name: string;
  active: boolean;
  logoUrl: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface CompetitionItem {
  id: number;
  name: string;
  active: boolean;
  logoUrl: string | null;
  sportId: number;
  sportName: string;
  countryId: number;
  countryName: string;
}

export interface TeamItem {
  id: number;
  name: string;
  active: boolean;
  logoUrl: string | null;
  competitionId: number;
  competitionName: string;
  sportId: number;
  sportName: string;
  countryId: number;
  countryName: string;
}

export interface SportsbookCatalogItem {
  id: number;
  name: string;
  active: boolean;
  baseUrl: string | null;
  logoUrl: string | null;
}
