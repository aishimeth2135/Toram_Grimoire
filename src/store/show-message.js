import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    messages: [],
    idCounter: 0
  },
  mutations: {
    appendMessage(state, msg) {
      state.messages.push(msg);
    },
    removeMessage(state, msg) {
      const msgs = state.messages;
      msgs.splice(msgs.indexOf(msg), 1);
    },
    increaseMessageCounter(state, msg) {
      ++msg.counter;
      msg.removeTime += 2;
    }
  },
  actions: {
    createMessage({ state, commit }, { icon, message, id }) {
      const find = id !== null ? state.messages.find(p => p.id !== null && p.id == id) : null;
      if (!find) {
        const msg = {
          icon,
          message,
          id,
          counter: 1,
          removeTime: 4,
          iid: state.idCounter
        };
        ++state.idCounter;
        const timer = setInterval(() => {
          --msg.removeTime;
          if (msg.removeTime <= 0) {
            commit('removeMessage', msg);
            clearInterval(timer);
          }
        }, 1000);

        commit('appendMessage', msg);
      }
      else {
        commit('increaseMessageCounter', find);
      }
    }
  }
});

export default store;