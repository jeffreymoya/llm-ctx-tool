export class Module2Class {
  data: string[];

  constructor() {
    this.data = [];
  }

  addData(item: string): void {
    this.data.push(item);
  }
}
