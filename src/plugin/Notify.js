import MessageNotify from "@services/Notify";

export default function(app) {
  app.config.globalProperties.$notify = MessageNotify;
}