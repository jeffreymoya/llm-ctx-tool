type Callback = (...args: unknown[]) => void;

export function debounce(func: Callback, wait: number): Callback {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: unknown[]): void {
    const later = (): void => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export class EventEmitter {
  private events: Record<string, Callback[]> = {};

  on(event: string, callback: Callback): void {
    this.events[event] ??= [];
    this.events[event]?.push(callback);
  }

  emit(event: string, ...args: unknown[]): void {
    this.events[event]?.forEach((callback) => callback(...args));
  }
}
