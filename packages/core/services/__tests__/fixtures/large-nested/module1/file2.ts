import { Module1Class } from './file1.ts';

export class ExtendedModule1 extends Module1Class {
  extendedProcess(): void {
    super.process();
    console.log('extended processing');
  }
}
