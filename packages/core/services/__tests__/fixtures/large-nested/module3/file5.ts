export const constants = {
  MAX_SIZE: 1000,
  DEFAULT_TIMEOUT: 5000,
  API_VERSION: 'v1',
};

export function validateSize(size: number): boolean {
  return size <= constants.MAX_SIZE;
}
