import { createStore } from 'vuex';


import confirm from './app/confirm';
import datas from './app/datas';
import initialize from './app/initialize';
import language from './app/language';
import leftMenu from './app/left-menu';
import nav from './app/nav';
import notify from './app/notify';
import main from './main';
import character from './views/character';
import damageCalculation from './views/damage-calculation';
import enchant from './views/enchant';

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
    confirm,
    'damage-calculation': damageCalculation,
  },
});

export default store;
