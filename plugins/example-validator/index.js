class ExampleValidatorPlugin {
  constructor() {
    this.name = 'example-validator';
    this.version = '1.0.0';
    this.description = 'Example validation plugin';
  }

  async initialize(context) {
    console.log('Example validator plugin initialized');
    // Register custom validator or extend pipeline
  }

  async destroy() {
    console.log('Example validator plugin destroyed');
  }
}

module.exports = ExampleValidatorPlugin; 