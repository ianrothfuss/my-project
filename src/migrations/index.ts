import * as migration_20251019_215207_initial_schema from './20251019_215207_initial_schema';

export const migrations = [
  {
    up: migration_20251019_215207_initial_schema.up,
    down: migration_20251019_215207_initial_schema.down,
    name: '20251019_215207_initial_schema'
  },
];
