import GetLang from '@/shared/services/Language';

type RegisterLangOptions = {
  readonly root: string;
  readonly extra?: {
    [key: string]: string;
  };
};

export default function(options: RegisterLangOptions | string) {
  if (typeof options === 'string') {
    options = {
      root: options,
    };
  }
  const { root, extra } = options;
  if (typeof root !== 'string') {
    console.warn('[Register Lang] option: root must be string.');
    return {
      rootLang: GetLang,
      lang: GetLang,
    };
  }

  const lang = (id: string, values?: Array<string>): string => {
    return GetLang(root + '/' + id, values);
  };
  lang.root = root;
  if (extra) {
    lang.extra = function(name: string, id: string, values: Array<string>) {
      return GetLang(extra[name] + '/' + id, values);
    };
  }

  return {
    rootLang: GetLang,
    lang,
  };
}
