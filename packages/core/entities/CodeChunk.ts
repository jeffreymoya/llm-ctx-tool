export class CodeChunk {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly filePath: string,
    public readonly startLine: number,
    public readonly endLine: number,
    public readonly metadata: Record<string, unknown> = {},
  ) {}

  static createId(filePath: string, startLine: number): string {
    return `${filePath}:${startLine}`;
  }

  get lineCount(): number {
    return this.endLine - this.startLine + 1;
  }
}
