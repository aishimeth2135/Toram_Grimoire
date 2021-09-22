import { StatComputed } from '@/lib/Character/Stat';

abstract class ResultContainerBase {
  abstract origin: string;
  abstract value: string;
  abstract get result(): string;
  abstract handle(handler: (value: string) => string): void;
}

class ResultContainer extends ResultContainerBase {
  override origin: string;
  override value: string;

  private _result: string;

  constructor(origin: string, value: string) {
    super();
    this.origin = origin;
    this.value = value;
    this._result = value.toString();
  }

  override get result() {
    return this._result;
  }

  override handle(handler: (value: string) => string) {
    this._result = handler(this._result);
  }
}

class ResultContainerStat extends ResultContainer {
  stat: StatComputed;

  constructor(origin: StatComputed, stat: StatComputed) {
    super(origin.value, stat.value);
    this.stat = stat;
  }
}

const TEXT_PARSE_PATTERN = /\$\{[^}]+\}/g;
class TextResultContainer extends ResultContainerBase {
  override origin: string;
  override value: string;
  containers: ResultContainer[];
  parts: (string | ResultContainer)[];

  constructor(value: string) {
    super();

    const textParts = value.split(TEXT_PARSE_PATTERN);
    const matches = value.match(TEXT_PARSE_PATTERN) || [];
    const
      parts: (string | ResultContainer)[] = [],
      containers: ResultContainer[] = [];
    Array(textParts.length + matches.length).fill('').forEach((el, idx) => {
      if (idx % 2 === 0) {
        parts.push(textParts.shift() as string);
      } else {
        const cur = matches.shift() as string;
        const container = new ResultContainer(cur, cur);
        this.containers.push(container);
        parts.push(container);
      }
    });

    this.origin = value;
    this.value = value;
    this.parts = parts;
    this.containers = containers;
  }

  override get result() {
    return this.parts.map(part => typeof part === 'string' ? part : part.result).join('');
  }

  override handle(handler: (value: string) => string) {
    this.containers.forEach(container => container.handle(handler));
  }
}

export { ResultContainerBase, ResultContainer, ResultContainerStat, TextResultContainer };
