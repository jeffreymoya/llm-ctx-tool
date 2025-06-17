export const deepConfig = {
  nested: {
    value: true,
    level: 3,
  },
};

export function deepFunction(): boolean {
  return deepConfig.nested.value;
}
