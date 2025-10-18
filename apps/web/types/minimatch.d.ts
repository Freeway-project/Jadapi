declare module 'minimatch' {
  export interface MinimatchOptions {
    debug?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    dot?: boolean;
    noext?: boolean;
    nocase?: boolean;
    nonull?: boolean;
    matchBase?: boolean;
    nocomment?: boolean;
    escape?: boolean;
    noquotes?: boolean;
    nonegate?: boolean;
    flipNegate?: boolean;
    ignoreCase?: boolean;
  }

  export class Minimatch {
    constructor(pattern: string, options?: MinimatchOptions);
    match(fname: string): boolean;
    matchOne(file: string[], pattern: string[]): boolean;
    debug(): void;
    makeRe(): RegExp | boolean;
    braceExpand(pattern?: string): string[];
    parse(pattern: string): string[];
    static defaults(def: MinimatchOptions): void;
  }

  export default function minimatch(target: string, pattern: string, options?: MinimatchOptions): boolean;
}