import MessageNotify from "@Services/Notify";

export default function(app) {
  app.config.globalProperties.$notify = MessageNotify;
}