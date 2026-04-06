export type Tier = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ProjectType {
  id: string;
  name: string;
  tier: Tier;
  tagline: string;
  description: string;
  examples: string[];
}

export type BlockStatus = 'required' | 'recommended' | 'optional' | 'hidden';

export interface Block {
  id: string;
  name: string;
  /** One-sentence plain-English summary */
  summary: string;
  /** Longer explanation for non-technical users */
  explanation: string;
  /** Why this block matters for the project */
  whyNeeded: string;
  /** Minimum tier where this block first appears */
  minTier: Tier;
  /** Returns the block's status for a given tier */
  statusForTier: (tier: Tier) => BlockStatus;
  /** IDs of tech options that belong to this block */
  techOptionIds: string[];
  /** IDs of libraries available for this block */
  libraryIds?: string[];
}

export interface TechOption {
  id: string;
  blockId: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  /** Whether this is the default/recommended choice */
  isDefault: boolean;
  /** URL for learning more */
  url?: string;
}

export interface BlockLibrary {
  id: string;
  blockId: string;
  name: string;
  category: string;
  description: string;
  url?: string;
}

export interface ModelRecommendation {
  id: string;
  name: string;
  provider: string;
  tiers: Tier[];
  description: string;
  /** What makes this model good for these tiers */
  reasoning: string;
  url?: string;
}

export interface ToolRecommendation {
  id: string;
  name: string;
  tiers: Tier[];
  /** Model recommendation IDs offered when this tool is selected (still filtered by project tier) */
  modelIds: string[];
  description: string;
  reasoning: string;
  url?: string;
}

export interface ProjectUrlResource {
  id: string;
  kind: 'url';
  /** Short label shown in the list */
  label: string;
  url: string;
}

export interface ProjectFileResource {
  id: string;
  kind: 'file';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** data:… URL (base64). Keep small for localStorage (see app limits). */
  dataUrl: string;
}

export type ProjectResource = ProjectUrlResource | ProjectFileResource;

export interface ProjectConfig {
  id: string;
  name: string;
  projectTypeId: string;
  selectedBlockIds: string[];
  /** Map of blockId -> selected techOptionId */
  techChoices: Record<string, string>;
  /** Free-form project description from user */
  projectDescription: string;
  /** Per–project-type detail fields (see projectTypeDetailFields) */
  typeDetails: Record<string, string>;
  /** ID of the user-chosen AI model (from modelRecommendations) */
  selectedModelId: string;
  /** IDs of user-chosen tools (from toolRecommendations) */
  selectedToolIds: string[];
  /** IDs of user-chosen libraries (from blockLibraries) */
  selectedLibraryIds: string[];
  /** IDs of chosen integrations (skills, MCPs, APIs, packages — see integrationCatalog) */
  selectedIntegrationIds: string[];
  /** User-added links and dropped files for docs / references */
  resources: ProjectResource[];
  /**
   * When false, the full-screen onboarding wizard is shown after choosing a project type.
   * Omitted or true = skip onboarding (default for workspaces saved before this flag existed).
   */
  onboardingCompleted?: boolean;
  createdAt: number;
  updatedAt: number;
}