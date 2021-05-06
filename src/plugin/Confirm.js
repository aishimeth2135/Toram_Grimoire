import store from "@/store";

export default function(app) {
  const confirm = item => store.commit('confirm/appendItem', item);
  app.config.globalProperties.$confirm = confirm;
}