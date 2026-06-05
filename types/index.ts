import { Role, Secteur, Region, StatutEntreprise, Periode, StatutValidation, TypeNote, StatutPublication } from '@prisma/client';

export type { Role, Secteur, Region, StatutEntreprise, Periode, StatutValidation, TypeNote, StatutPublication };

export interface DashboardStats {
  totalEntreprises: number;
  entreprisesActives: number;
  totalProductions: number;
  totalEmployes: number;
  totalExport: number;
  croissanceProduction: number;
}

export interface ProductionKPI {
  periode: string;
  volumeTotal: number;
  valeurTotal: number;
  emploisTotal: number;
  capaciteMoyenne: number;
  tauxQualiteMoyen: number;
}

export interface SecteurStats {
  secteur: Secteur;
  nombreEntreprises: number;
  volumeProduction: number;
  valeurProduction: number;
  pourcentage: number;
}

export interface RegionStats {
  region: Region;
  nombreEntreprises: number;
  volumeProduction: number;
  emplois: number;
}

export interface AlertItem {
  id: string;
  type: string;
  niveau: 'INFO' | 'WARNING' | 'CRITICAL';
  titre: string;
  description: string;
  date: Date;
}

export interface FilterParams {
  secteur?: Secteur;
  region?: Region;
  statut?: StatutEntreprise;
  ville?: string;
  estExportateur?: boolean;
  search?: string;
}
