import 'reflect-metadata';
import { container } from 'tsyringe';

export const AppContainer = container.createChildContainer();

// Export singleton instance
export { AppContainer as container };
