import { createStore } from 'vuex';

import main from "./main";

import language from "./app/language";
import initialize from "./app/initialize";
import notify from "./app/notify";
import leftMenu from "./app/left-menu";
import nav from "./app/nav";
import confirm from "./app/confirm";
import datas from "./app/datas";

import character from "./views/character";
import enchant from "./views/enchant";

const store = createStore({
  modules: {
    main,
    language,
    initialize,
    notify,
    'left-menu': leftMenu,
    nav,
    datas,
    character,
    enchant,
    confirm
  }
});

export default store;