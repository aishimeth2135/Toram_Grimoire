interface MarkTextOptions {
  mark?: string;
  underline?: string;
}

/**
 * Mark the text by html code.
 */
export function markText(str: string, {
  mark = 'text-primary-60',
  underline = 'text-primary-60',
}: MarkTextOptions = {}): string {
  return str
    .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="${mark}">${p1}</span>`)
    .replace(/\(\(_((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="cy--text-underline ${underline}">${p1}</span>`)
}

