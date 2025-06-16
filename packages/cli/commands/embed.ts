export interface EmbedOptions {
  cwd?: string;
  dryRun?: boolean;
  logger?: (msg: string) => void;
}

export function embedProject(options: EmbedOptions = {}): number {
  const logger = options.logger ?? console.log;
  logger('Embed command not yet implemented.');
  return 0;
}

export default embedProject;
