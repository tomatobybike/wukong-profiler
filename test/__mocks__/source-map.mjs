export class SourceMapConsumer {
  constructor() {}

  originalPositionFor() {
    return {
      source: 'src/mock.ts',
      line: 123,
      column: 4,
      name: 'mockFn'
    }
  }

  destroy() {}
}
