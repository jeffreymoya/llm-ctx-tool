import type { CodeChunk } from '@ports/types';

import { PassThroughValidator } from '../../validators/PassThroughValidator.ts';

describe('PassThroughValidator', () => {
  let validator: PassThroughValidator;

  beforeEach(() => {
    validator = new PassThroughValidator();
  });

  it('should pass through input unchanged', async () => {
    const input: CodeChunk = {
      id: 'test',
      content: 'function test() {}',
      filePath: '/test.ts',
      startLine: 1,
      endLine: 1,
      metadata: {},
    };

    const result = await validator.process(input);
    expect(result).toEqual(input);
  });

  it('should have correct name', () => {
    expect(validator.name).toBe('pass-through');
  });
});
