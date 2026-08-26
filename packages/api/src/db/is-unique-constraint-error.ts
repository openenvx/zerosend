export function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('UNIQUE constraint failed');
  }

  return false;
}
