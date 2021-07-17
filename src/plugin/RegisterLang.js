import GetLang from "@services/Language";

export default function install(app) {
  app.config.globalProperties.$rootLang = GetLang;

  app.mixin({
    beforeCreate() {
      if (this.$options.RegisterLang) {
        let options = this.$options.RegisterLang;
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
        this.$lang = function(id, values) {
          return GetLang(root + '/' + id, values);
        };
        this.$lang.root = root;
        if (extra) {
          this.$lang.extra = function(name, id, values) {
            return GetLang(extra[name] + '/' + id, values);
          }
        }
      }
    },
  });
}
