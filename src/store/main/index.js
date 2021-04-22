import { createStore } from 'vuex';

import main from "./main.js";

import language from "./language";
import initialize from "./initialize";
import notify from "./notify";
import leftMenu from "./left-menu";
import nav from "./nav";

import datas from "./datas";
import character from "./character";

const store = createStore({
  modules: {
    main,
    language,
    initialize,
    notify,
    leftMenu,
    nav,
    datas,
    character
  }
});

export default store;