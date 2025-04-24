export function getErrorMessage(error: unknown): string {
  return String(error instanceof Error ? error.message : JSON.stringify(error));
}
