import { CodeChunk } from '../CodeChunk.ts';

describe('CodeChunk', () => {
  it('should correctly create an ID based on file path and start line', () => {
    const filePath = 'path/to/file.ts';
    const startLine = 10;
    const expectedId = 'path/to/file.ts:10';
    expect(CodeChunk.createId(filePath, startLine)).toBe(expectedId);
  });

  it('should correctly calculate line count for a single-line chunk', () => {
    const chunk = new CodeChunk('id', 'content', 'file.ts', 5, 5);
    expect(chunk.lineCount).toBe(1);
  });

  it('should correctly calculate line count for a multi-line chunk', () => {
    const chunk = new CodeChunk('id', 'content', 'file.ts', 10, 15);
    expect(chunk.lineCount).toBe(6);
  });
});
