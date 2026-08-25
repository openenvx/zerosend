import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  client: {},
  clientPrefix: 'VITE_',
  emptyStringAsUndefined: true,
  runtimeEnv: (import.meta as any).env,
});
