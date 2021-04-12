import GetLang from "@Services/Language";

function install(Vue) {
  Vue.prototype.$globalLang = GetLang;
  Vue.mixin({
    beforeCreate() {
      const parent = this.$options.parent;
      if (this.$options.RegisterLang) {
        let options = this.$options.RegisterLang;
        if (typeof options === 'string') {
          options = {
            root: options
          };
        }
        const { root, inherit=false } = options;
        if (typeof root !== 'string') {
          console.warn('[Register Lang] option: root must be string.');
          return;
        }
        const realInherit = parent && parent.$lang && inherit;
        this.$lang = function(id, values) {
          const fromParent = realInherit ? parent.$lang.root + '/' : '';
          return GetLang(fromParent + root + '/' + id, values);
        };
        this.$lang.root = root;
        this.$lang.parent = realInherit ? parent.$lang : null; 
      } else if (parent && parent.$lang) {
        this.$lang = this.$options.parent.$lang;
      }
    }
  });
}

export default {
  install
};