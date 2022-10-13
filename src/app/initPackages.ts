import Iconify from '@iconify/iconify'
import jsep from 'jsep'
import { marked } from 'marked'

import Cyteria from '@/shared/utils/Cyteria'

export default function () {
  // jsep
  jsep.addIdentifierChar('@')
  jsep.addIdentifierChar('#')

  // marked
  const cyBracket: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'cyBracket',
    level: 'inline',
    start(src) {
      return src.match(/\(\(=/)?.index
    },
    tokenizer(src) {
      const rule = /^\(\(=((?:(?!\(\().)+)\)\)/
      const match = rule.exec(src)
      if (match) {
        return {
          type: 'cyBracket',
          raw: match[0],
          tokens: this.lexer.inlineTokens(match[1].trim()),
        }
      }
    },
    renderer(token) {
      return `<span class="border-l-1 border-r-1 border-current mx-2 px-2 text-primary-70">${this.parser.parseInline(
        token.tokens!
      )}</span>`
    },
  }
  marked.use({
    renderer: {
      checkbox(checked) {
        const path = checked
          ? 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29a.996.996 0 0 1-1.41 0L5.71 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.58 7.59z'
          : 'M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'
        const textClass = checked ? 'text-primary-50' : 'text-primary-30'
        return `<svg xmlns="http://www.w3.org/2000/svg" width="1.125rem" height="1.125rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="${textClass} mr-2"><path fill="currentColor" d="${path}" /></svg>`
      },
    },
    extensions: [cyBracket],
  })

  // iconify
  if (import.meta.env.PROD) {
    Iconify.disableCache('all')
    if (Cyteria.storageAvailable('localStorage')) {
      const storage = window.localStorage
      Array(localStorage.length)
        .fill(null)
        .map((_item, idx) => idx)
        .forEach(idx => {
          const key = storage.key(idx)
          if (key && key.startsWith('iconify')) {
            storage.removeItem(key)
          }
        })
    }
  }
}
