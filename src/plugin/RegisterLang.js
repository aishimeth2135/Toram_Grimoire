import GetLang from "@Services/Language";

function install(app) {
  app.config.globalProperties.$globalLang = GetLang;
  app.mixin({
    beforeCreate() {
      const parent = this.$options.parent;
      if (this.$options.RegisterLang) {
        let options = this.$options.RegisterLang;
        if (typeof options === 'string') {
          options = {
            root: options
          };
        }
        const { root, extra } = options;
        if (typeof root !== 'string') {
          console.warn('[Register Lang] option: root must be string.');
          return;
        }
        this.$lang = function(id, values) {
          return GetLang(root + '/' + id, values);
        };
        this.$lang.root = root;
        if (extra) {
          this.$lang.extra = function(name, id, values) {
            return GetLang(extra[name] + '/' + id, values);
          }
        }
      } else if (parent && parent.$lang) {
        this.$lang = this.$options.parent.$lang;
      }
    }
  });
}

export default {
  install
};