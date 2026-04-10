import fs from 'fs';
import path from 'path';
import { Profile, ProfileIndex, ProfileCreateOptions } from './types';

const PROFILE_INDEX_FILE = '.stacksnap/profiles.json';

export function loadProfileIndex(): ProfileIndex {
  if (!fs.existsSync(PROFILE_INDEX_FILE)) {
    return { profiles: {} };
  }
  const raw = fs.readFileSync(PROFILE_INDEX_FILE, 'utf-8');
  return JSON.parse(raw) as ProfileIndex;
}

export function saveProfileIndex(index: ProfileIndex): void {
  const dir = path.dirname(PROFILE_INDEX_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PROFILE_INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

export function createProfile(options: ProfileCreateOptions): Profile {
  const now = new Date().toISOString();
  const profile: Profile = {
    name: options.name,
    description: options.description,
    tags: options.tags ?? [],
    snapshotPath: options.snapshotPath,
    createdAt: now,
    updatedAt: now,
  };

  const index = loadProfileIndex();
  if (index.profiles[options.name]) {
    throw new Error(`Profile "${options.name}" already exists.`);
  }
  index.profiles[options.name] = profile;
  saveProfileIndex(index);
  return profile;
}

export function getProfile(name: string): Profile | undefined {
  const index = loadProfileIndex();
  return index.profiles[name];
}

export function listProfiles(): Profile[] {
  const index = loadProfileIndex();
  return Object.values(index.profiles);
}

export function deleteProfile(name: string): boolean {
  const index = loadProfileIndex();
  if (!index.profiles[name]) return false;
  delete index.profiles[name];
  if (index.default === name) delete index.default;
  saveProfileIndex(index);
  return true;
}

export function setDefaultProfile(name: string): void {
  const index = loadProfileIndex();
  if (!index.profiles[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  index.default = name;
  saveProfileIndex(index);
}
