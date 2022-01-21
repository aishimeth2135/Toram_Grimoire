

interface MarkTextOptions {
  mark?: string;
  underline?: string;
}

/**
 * Mark the text by html code.
 */
export function markText(str: string, {
  mark = 'text-light-4',
  underline = 'text-light-4',
}: MarkTextOptions = {}): string {
  return str
    .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="${mark}">${p1}</span>`)
    .replace(/\(\(_((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="cy--text-underline ${underline}">${p1}</span>`)
}

