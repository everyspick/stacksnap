export interface Profile {
  name: string;
  description?: string;
  tags: string[];
  snapshotPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileIndex {
  profiles: Record<string, Profile>;
  default?: string;
}

export interface ProfileCreateOptions {
  name: string;
  description?: string;
  tags?: string[];
  snapshotPath: string;
}
