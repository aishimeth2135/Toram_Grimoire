import GetLang from '@services/Language';

/**
 * @typedef RegisterLangOptions
 * @property {string} root
 * @property {Object<string, string>} extra
 */
/**
 * @param {RegisterLangOptions | string} options
 */
export default function(options) {
  if (typeof options === 'string') {
    options = {
      root: options,
    };
  }
  const { root, extra } = options;
  if (typeof root !== 'string') {
    console.warn('[Register Lang] option: root must be string.');
    return;
  }
  /**
   * @param {string} id
   * @param {Array<number|string>} [values]
   * @returns {string}
   */
  const lang = (id, values) => {
    return GetLang(root + '/' + id, values);
  };
  lang.root = root;
  if (extra) {
    lang.extra = function(name, id, values) {
      return GetLang(extra[name] + '/' + id, values);
    }
  }

  return {
    rootLang: GetLang,
    lang,
  };
}
