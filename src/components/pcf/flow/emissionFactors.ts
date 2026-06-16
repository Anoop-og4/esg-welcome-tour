// ─── Static emission-factor library ───
// A curated, representative dataset for the PCF builder. Values are illustrative
// (rounded, secondary-data style) and grouped by category. Every factor carries
// its source + year + region so it can be stamped onto a node for auditability.
//
// NOTE: these are demo figures for the POC — not certified for reporting. In
// production this would be backed by ecoinvent / DEFRA / EPA / Climatiq APIs.

export type EFCategory =
  | "Materials"
  | "Energy"
  | "Transport"
  | "Processing"
  | "Packaging"
  | "Waste";

export interface EmissionFactor {
  id: string;
  name: string;
  category: EFCategory;
  /** kgCO2e per `unit` */
  value: number;
  /** the denominator unit, e.g. kg, kWh, tonne-km */
  unit: string;
  source: string;
  year: number;
  region: string;
}

/** label shown on a node/badge for a chosen factor */
export function factorUnitLabel(ef: Pick<EmissionFactor, "unit">): string {
  return `kgCO2e/${ef.unit}`;
}

export const EMISSION_FACTORS: EmissionFactor[] = [
  // ─── Materials ───
  { id: "mat-steel-primary", name: "Steel (primary)", category: "Materials", value: 2.21, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-steel-recycled", name: "Steel (recycled)", category: "Materials", value: 0.68, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-alu-primary", name: "Aluminium (primary)", category: "Materials", value: 8.24, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-alu-recycled", name: "Aluminium (recycled)", category: "Materials", value: 1.45, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-pet", name: "Plastic — PET (virgin)", category: "Materials", value: 3.10, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-rpet", name: "Plastic — rPET (recycled)", category: "Materials", value: 1.15, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-hdpe", name: "Plastic — HDPE", category: "Materials", value: 1.93, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-glass", name: "Glass (container)", category: "Materials", value: 0.85, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "mat-cotton", name: "Cotton fabric", category: "Materials", value: 16.50, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-polyester", name: "Polyester fabric", category: "Materials", value: 9.52, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "mat-paper", name: "Paper (uncoated)", category: "Materials", value: 0.92, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "mat-cardboard", name: "Cardboard (corrugated)", category: "Materials", value: 0.74, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "mat-timber", name: "Timber (sawn)", category: "Materials", value: 0.46, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },

  // ─── Energy ───
  { id: "en-elec-eu", name: "Grid electricity — EU", category: "Energy", value: 0.23, unit: "kWh", source: "EEA", year: 2023, region: "EU-27" },
  { id: "en-elec-us", name: "Grid electricity — US", category: "Energy", value: 0.37, unit: "kWh", source: "EPA eGRID", year: 2023, region: "US" },
  { id: "en-elec-uk", name: "Grid electricity — UK", category: "Energy", value: 0.21, unit: "kWh", source: "DEFRA", year: 2024, region: "UK" },
  { id: "en-elec-in", name: "Grid electricity — India", category: "Energy", value: 0.71, unit: "kWh", source: "CEA", year: 2023, region: "India" },
  { id: "en-elec-cn", name: "Grid electricity — China", category: "Energy", value: 0.58, unit: "kWh", source: "IEA", year: 2023, region: "China" },
  { id: "en-elec-renewable", name: "Electricity — renewable (PPA)", category: "Energy", value: 0.02, unit: "kWh", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "en-natgas", name: "Natural gas (combustion)", category: "Energy", value: 0.20, unit: "kWh", source: "DEFRA", year: 2024, region: "UK" },
  { id: "en-diesel", name: "Diesel (stationary)", category: "Energy", value: 2.68, unit: "litre", source: "DEFRA", year: 2024, region: "UK" },
  { id: "en-steam", name: "Steam (industrial)", category: "Energy", value: 0.19, unit: "kWh", source: "ecoinvent 3.9", year: 2023, region: "Global" },

  // ─── Transport ───
  { id: "tr-truck", name: "Road freight — HGV truck", category: "Transport", value: 0.11, unit: "tonne-km", source: "DEFRA", year: 2024, region: "UK" },
  { id: "tr-van", name: "Road freight — van", category: "Transport", value: 0.55, unit: "tonne-km", source: "DEFRA", year: 2024, region: "UK" },
  { id: "tr-rail", name: "Rail freight", category: "Transport", value: 0.028, unit: "tonne-km", source: "DEFRA", year: 2024, region: "UK" },
  { id: "tr-sea", name: "Sea freight — container ship", category: "Transport", value: 0.016, unit: "tonne-km", source: "DEFRA", year: 2024, region: "Global" },
  { id: "tr-air", name: "Air freight — long haul", category: "Transport", value: 0.60, unit: "tonne-km", source: "DEFRA", year: 2024, region: "Global" },

  // ─── Processing ───
  { id: "pr-injection", name: "Plastic injection moulding", category: "Processing", value: 0.80, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "pr-machining", name: "CNC machining (metal)", category: "Processing", value: 1.20, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "pr-casting", name: "Metal casting", category: "Processing", value: 1.05, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "pr-dyeing", name: "Textile dyeing & finishing", category: "Processing", value: 3.40, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },

  // ─── Packaging ───
  { id: "pk-corrugated-box", name: "Corrugated box", category: "Packaging", value: 0.74, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "pk-pet-bottle", name: "PET bottle (per unit, 0.5L)", category: "Packaging", value: 0.082, unit: "unit", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "pk-alu-can", name: "Aluminium can (per unit)", category: "Packaging", value: 0.099, unit: "unit", source: "ecoinvent 3.9", year: 2023, region: "Global" },
  { id: "pk-stretch-film", name: "LDPE stretch film", category: "Packaging", value: 2.20, unit: "kg", source: "ecoinvent 3.9", year: 2023, region: "Global" },

  // ─── Waste / End of Life ───
  { id: "wa-landfill", name: "Landfill — mixed waste", category: "Waste", value: 0.45, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "wa-incineration", name: "Incineration (energy recovery)", category: "Waste", value: 0.21, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "wa-recycling", name: "Recycling (open-loop)", category: "Waste", value: 0.02, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
  { id: "wa-composting", name: "Composting (organic)", category: "Waste", value: 0.01, unit: "kg", source: "DEFRA", year: 2024, region: "UK" },
];

export const EF_CATEGORIES: EFCategory[] = [
  "Materials",
  "Energy",
  "Transport",
  "Processing",
  "Packaging",
  "Waste",
];

export function getFactorById(id?: string): EmissionFactor | undefined {
  if (!id) return undefined;
  return EMISSION_FACTORS.find((f) => f.id === id);
}
