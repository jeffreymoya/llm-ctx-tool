// This file intentionally has TypeScript errors for testing error handling
export class BrokenClass {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  undefinedProperty: any;

  // Missing type annotation and syntax error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(value: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getValue() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.undefinedProperty; // Reference error
  }
}

// Missing function body - intentional compilation error
export function brokenFunction(input: string & { nonExistentMethod: () => string }): string {
  return input.nonExistentMethod();
}

// Incomplete object with proper syntax
export const incompleteObject = {
  key: 'value',
};
