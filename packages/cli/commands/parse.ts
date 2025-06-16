export interface ParseOptions {
  cwd?: string;
  dryRun?: boolean;
  logger?: (msg: string) => void;
}

export function parseProject(options: ParseOptions = {}): number {
  const logger = options.logger ?? console.log;
  logger('Parse command not yet implemented.');
  return 0;
}

export default parseProject;
