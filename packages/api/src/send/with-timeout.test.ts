import { describe, expect, it, vi } from 'vitest';

import { SendEmailTimeoutError, withTimeout } from './with-timeout';

describe('withTimeout', () => {
  it('resolves when the promise completes before the deadline', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 1000)).resolves.toBe('ok');
  });

  it('rejects with SendEmailTimeoutError when the deadline elapses', async () => {
    vi.useFakeTimers();

    const pending = withTimeout(new Promise<string>(() => {}), 50);

    vi.advanceTimersByTime(50);

    await expect(pending).rejects.toBeInstanceOf(SendEmailTimeoutError);
    vi.useRealTimers();
  });
});
