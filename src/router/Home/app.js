import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/main/Cyteria/Cyteria.css";
import "@css/main/global.css";

import app from "./app.vue";

import vue_home from "@views/Home/main.vue";
import vue_about from "@views/Home/about.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";


export default {
    path: '/',
    component: app,
    beforeEnter(to, from, next){
        init();
        next();
    },
    meta: {
        title: null,
        leftMenuViewButtons: [{
            title: () => GetLang('Left Menu/Home/base'),
            icon: 'gridicons-user',
            path: ''
        }, {
            title: () => GetLang('Left Menu/Home/about'),
            icon: 'bx-bxs-star-half',
            path: '/about'
        }]
    },
    children: [{
        path: '',
        component: vue_home
    }, {
        path: 'about',
        component: vue_about
    }]
};