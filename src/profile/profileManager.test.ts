import fs from 'fs';
import { createProfile, getProfile, listProfiles, deleteProfile, setDefaultProfile, loadProfileIndex } from './profileManager';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

const mockIndex = { profiles: {} };

beforeEach(() => {
  jest.resetAllMocks();
  mockedFs.existsSync.mockReturnValue(false);
  mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockIndex));
  mockedFs.writeFileSync.mockImplementation(() => {});
  mockedFs.mkdirSync.mockImplementation(() => undefined);
});

describe('createProfile', () => {
  it('creates a new profile and saves it', () => {
    const profile = createProfile({ name: 'work', snapshotPath: '.stacksnap/work.json', tags: ['node'] });
    expect(profile.name).toBe('work');
    expect(profile.tags).toContain('node');
    expect(mockedFs.writeFileSync).toHaveBeenCalled();
  });

  it('throws if profile already exists', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ profiles: { work: { name: 'work', tags: [], snapshotPath: '', createdAt: '', updatedAt: '' } } })
    );
    expect(() => createProfile({ name: 'work', snapshotPath: '.stacksnap/work.json' })).toThrow('already exists');
  });
});

describe('getProfile', () => {
  it('returns undefined for missing profile', () => {
    expect(getProfile('nonexistent')).toBeUndefined();
  });

  it('returns profile when it exists', () => {
    const p = { name: 'dev', tags: [], snapshotPath: 'snap.json', createdAt: '', updatedAt: '' };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ profiles: { dev: p } }));
    expect(getProfile('dev')).toEqual(p);
  });
});

describe('deleteProfile', () => {
  it('returns false when profile does not exist', () => {
    expect(deleteProfile('ghost')).toBe(false);
  });

  it('removes profile and clears default if matched', () => {
    const p = { name: 'dev', tags: [], snapshotPath: 'snap.json', createdAt: '', updatedAt: '' };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ profiles: { dev: p }, default: 'dev' }));
    const result = deleteProfile('dev');
    expect(result).toBe(true);
    const written = JSON.parse((mockedFs.writeFileSync.mock.calls[0][1] as string));
    expect(written.profiles['dev']).toBeUndefined();
    expect(written.default).toBeUndefined();
  });
});

describe('setDefaultProfile', () => {
  it('throws when profile not found', () => {
    expect(() => setDefaultProfile('missing')).toThrow('not found');
  });

  it('sets the default profile', () => {
    const p = { name: 'dev', tags: [], snapshotPath: 'snap.json', createdAt: '', updatedAt: '' };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ profiles: { dev: p } }));
    setDefaultProfile('dev');
    const written = JSON.parse((mockedFs.writeFileSync.mock.calls[0][1] as string));
    expect(written.default).toBe('dev');
  });
});
