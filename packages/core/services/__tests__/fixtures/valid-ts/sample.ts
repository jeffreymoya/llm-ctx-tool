export class SampleClass {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

export function sampleFunction(input: string): string {
  return `processed: ${input}`;
}

export default SampleClass;
