import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";
import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";

function Lang(s, vs){
    return GetLang('Item Query/Search/' + s, vs);
}

export default class SearchController {
    constructor(parent){
        this.parent = parent;
        this.nodes = {
            result: null
        };
        this.status = {
            resultMaximum: 100
        };
    }
    init(main_node){
        const simpleCreateHTML = CY.element.simpleCreateHTML;
        const opts_menu = simpleCreateHTML('ul', 'options-menu');
        const opts = simpleCreateHTML('div', 'options-scope');
        this.nodes.optionsScope = opts;

        const ctrr = this;

        function createButtonScope(){
            return simpleCreateHTML('div', 'button-scope');
        }
        function createSearchButtonScope(lis){
            const t = simpleCreateHTML('div', 'search-button-scope');
            const search_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' + '<span class="text">' + Lang('search') + '</span>');
            search_btn.addEventListener('click', lis);
            t.appendChild(search_btn);
            return t;
        }
        function createSearchCategoryScope(){
            const t = simpleCreateHTML('ul', 'search-category');
            Lang('Equipmemt Category list').forEach((p, i) => {
                const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'cur'], p, {'data-i': i});
                li.addEventListener('click', toggle_select_listener);
                t.appendChild(li);
            });
            return t;
        }
        function checkItemCategory(node, item){
            const l = getSelectedOptions(node, 'data-i').map(a => parseInt(a));
            return l.indexOf(item.category) != -1;
        }
        function createSearchObtainTypeScope(){
            const t = simpleCreateHTML('ul', 'search-category-type');
            ['smith', 'boss', 'mini_boss', 'mobs', 'quest', 'other'].forEach(a => {
                const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'cur'], Lang('item detail/obtains/' + a), {'data-type': a});
                li.addEventListener('click', toggle_select_listener);
                t.appendChild(li);
            });
            return t;
        }
        function checkItemObtainType(node, item){
            const l = getSelectedOptions(node, 'data-type');
            return item.obtains.find(a => l.indexOf(a['type']) != -1);
        }
        function toggle_select_listener(e){
            this.classList.toggle('cur');
        }
        function getSelectedOptions(node, data_name){
            return Array.from(node.querySelectorAll('.cur'))
                .map(typeof data_name === 'function' ? data_name : a => a.getAttribute(data_name));
        }
        function selectAllOption_listener(e){
            this.parentNode.nextSibling.querySelectorAll('li').forEach(a => a.classList.add('cur'));
        }
        function cancelAllOption_listener(e){
            this.parentNode.nextSibling.querySelectorAll('li.cur').forEach(a => a.classList.remove('cur'));
        }
        function createButtonScopeTitle(name){
            const t = simpleCreateHTML('div', 'title-scope');
            t.appendChild(simpleCreateHTML('span', 'title', Lang('option scope title/' + name)));
            const sel_all = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'text-small'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M17.3 6.3c-.39-.39-1.02-.39-1.41 0l-5.64 5.64 1.41 1.41L17.3 7.7c.38-.38.38-1.02 0-1.4zm4.24-.01l-9.88 9.88-3.48-3.47c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L22.95 7.71c.39-.39.39-1.02 0-1.41h-.01c-.38-.4-1.01-.4-1.4-.01zM1.12 14.12L5.3 18.3c.39.39 1.02.39 1.41 0l.7-.7-4.88-4.9c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.03 0 1.42z"/></svg><span class="text">' + Lang('option scope title/button/select all') + '</span>');
            sel_all.addEventListener('click', selectAllOption_listener);
            const cel_all = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'text-small'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg><span class="text">' + Lang('option scope title/button/cancel all') + '</span>');
            cel_all.addEventListener('click', cancelAllOption_listener);
            t.appendChild(sel_all);
            t.appendChild(cel_all);
            return t;
        }


        function li_listener(e){
            const c = this.getAttribute('data-category');
            const scope = ctrr.nodes.optionsScope.querySelector('.options-' + c);
            const cur = this.parentNode.querySelector('.cur');
            if ( cur ){
                cur.classList.remove('cur');
                ctrr.nodes.optionsScope
                    .querySelector('.options-' + cur.getAttribute('data-category'))
                    .classList.add('hidden');
            }
            this.classList.add('cur');
            scope.classList.remove('hidden');
            CY.element.removeAllChild(ctrr.nodes.result);
        }

        ['main', 'stat', 'item-level'].forEach((p, i) => {
            const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], Lang('options menu/' + p), {'data-category': p});
            opts_menu.appendChild(li);
            li.addEventListener('click', li_listener);
            if ( i == 0 )
                li.classList.add('cur');

            const frg = document.createDocumentFragment();
            switch (p){
                case 'main': {
                    const search_scope = simpleCreateHTML('div', 'search-scope');
                    const input = simpleCreateHTML('input', 'search', null, {'placeholder': Lang('search placeholder')});
                    search_scope.appendChild(simpleCreateHTML('span', 'icon', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'));
                    search_scope.appendChild(input);
                    frg.appendChild(search_scope);

                    const btn_scope = createButtonScope();
                    
                    const search_by_ul = simpleCreateHTML('ul', 'search-by');
                    ['name', 'material', 'dye', 'obtain-name'].forEach(a => {
                        const _li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], Lang('options: main/search by: ' + a), {'data-name': a});
                        _li.addEventListener('click', toggle_select_listener);
                        search_by_ul.appendChild(_li);
                        _li.classList.add('cur');
                    });
                    btn_scope.appendChild(createButtonScopeTitle('search by'));
                    btn_scope.appendChild(search_by_ul);

                    const search_category_ul = createSearchCategoryScope();
                    btn_scope.appendChild(createButtonScopeTitle('category'));
                    btn_scope.appendChild(search_category_ul);

                    const search_obtain_type_ul = createSearchObtainTypeScope();
                    btn_scope.appendChild(createButtonScopeTitle('obtain type'));
                    btn_scope.appendChild(search_obtain_type_ul);

                    function search_listener(e){
                        // if ( input.value === '' )
                        //     return;
                        const searchList = getSelectedOptions(search_by_ul, 'data-name');
                        const res = [];
                        const search_values = input.value.toLowerCase().split(/\s*,\s*/);
                        ctrr.parent.items.equipments.forEach(item => {
                            if ( res.length == ctrr.status.resultMaximum )
                                return;
                            if ( !checkItemCategory(search_category_ul, item) || !checkItemObtainType(search_obtain_type_ul, item) )
                                return;
                            if ( input.value !== '' ){
                                const check = search_values.find(v => {
                                    return searchList.find(a => {
                                        switch (a){
                                            case 'name':
                                                return item.name.toLowerCase().includes(v);
                                            case 'material':
                                                return item.recipe && item.recipe['materials'] && item.recipe['materials'].find(c => c.name.toLowerCase().includes(v));
                                            case 'dye':
                                                return item.obtains.find(b => b['dye'] && b['dye'].toLowerCase().includes(v));
                                            case 'obtain-name':
                                                return item.obtains.find(b => b['name'] && b['name'].toLowerCase().includes(v));
                                        }
                                    })
                                });
                                if ( check )
                                    res.push(item);
                            }
                            else
                                res.push(item);
                        });
                        ctrr.showResult(res);
                    }

                    const search_result_scope = createSearchButtonScope(search_listener);
                    btn_scope.appendChild(search_result_scope);

                    frg.appendChild(btn_scope);
                }
                break;
                case 'stat': {
                    const ICONS = {
                        down: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>',
                        up: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.12 14.71L12 10.83l3.88 3.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 8.71c-.39-.39-1.02-.39-1.41 0L6.7 13.3c-.39.39-.39 1.02 0 1.41.39.38 1.03.39 1.42 0z"/></svg>',
                        hline: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>'
                    };
                    const stats_scope = simpleCreateHTML('div', 'stats-scope');

                    const search_scope = simpleCreateHTML('div', 'search-scope');
                    const input = simpleCreateHTML('input', 'search', null, {'placeholder': Lang('search placeholder')});
                    search_scope.appendChild(simpleCreateHTML('span', 'icon', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'));
                    search_scope.appendChild(input);
                    frg.appendChild(search_scope);

                    input.addEventListener('change', function(e){
                        if ( input.value === '' )
                            return;
                        const stats_scope_list = stats_scope.querySelectorAll('.stat');
                        stats_scope_list.forEach(a => a.classList.remove('cur'));
                        const _v = input.value.toLowerCase();
                        const l = _v.split(/\s*,\s*/);
                        let has = false;
                        stats_scope_list.forEach(a => {
                            if ( _v == '@all' ){
                                a.classList.remove('hidden');
                                return;
                            }
                            const t = a.querySelector('.text').innerHTML;
                            if ( l.find(b => t.toLowerCase().includes(b)) ){
                                a.classList.remove('hidden');
                                has = true;
                            }
                            else
                                a.classList.add('hidden');
                        });
                        if ( has )
                            stat_scope_tips.classList.add('hidden');
                        else {
                            stat_scope_tips.classList.remove('hidden');
                            stat_scope_tips.innerHTML = Lang('tips/stats search: no result');
                        }
                    });

                    const statList = Grimoire.CharacterSystem.statList;

                    function switch_sort(e){
                        const t = parseInt(this.parentNode.getAttribute('data-sort'));
                        this.parentNode.setAttribute('data-sort', ['1', '2', '0'][t]);
                        this.innerHTML = [
                            ICONS.up,
                            ICONS.hline,
                            ICONS.down
                        ][t];
                        e.stopPropagation();
                    }
                    statList.forEach(a => {
                        [0, 1].forEach(b => {
                            if ( b == 1 && !a.hasMultiplier )
                                return;
                            const stat = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'stat', 'hidden'], null,
                                {
                                    'data-sort': '0',
                                    'data-bn': a.baseName,
                                    'data-type': b
                                }
                            );
                            stat.addEventListener('click', toggle_select_listener);
                            stat.appendChild(simpleCreateHTML('span', 'text', b == 0 ? a.text : a.text + '%'));
                            const toggle_sort_btn = simpleCreateHTML('span', ['icon', 'sort'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>');
                            toggle_sort_btn.addEventListener('click', switch_sort);
                            stat.appendChild(toggle_sort_btn);
                            stats_scope.appendChild(stat);
                        });
                    });
                    const stat_scope_tips = simpleCreateHTML('div', 'tips', Lang('tips/stats search: first'));
                    stats_scope.appendChild(stat_scope_tips);

                    const btn_scope = createButtonScope();

                    const search_category_ul = createSearchCategoryScope();
                    btn_scope.appendChild(createButtonScopeTitle('category'));
                    btn_scope.appendChild(search_category_ul);

                    const search_obtain_type_ul = createSearchObtainTypeScope();
                    btn_scope.appendChild(createButtonScopeTitle('obtain type'));
                    btn_scope.appendChild(search_obtain_type_ul);

                    function search_listener(e){
                        const search_list = getSelectedOptions(stats_scope, a => {
                            return {
                                baseName: a.getAttribute('data-bn'),
                                sort: parseInt(a.getAttribute('data-sort'), 10),
                                type: a.getAttribute('data-type') === '0' ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER
                            }
                        });

                        if ( search_list.length == 0 )
                            return;

                        const res = [];

                        ctrr.parent.items.equipments.forEach(item => {
                            if ( res.length == ctrr.status.resultMaximum )
                                return;
                            if ( !checkItemCategory(search_category_ul, item) || !checkItemObtainType(search_obtain_type_ul, item) )
                                return;
                            const check = search_list.every(a => item.stats.find(b => a.baseName == b.baseName() && a.type == b.type));
                            if ( check )
                                res.push(item);
                        });
                        res.sort((a, b) => {
                            for (let i=0; i<search_list.length; ++i){
                                const c = search_list[i];
                                if ( c.sort == 2 )
                                    continue;
                                const fun = q => q.baseName() == c.baseName && q.type == c.type;
                                const ar = a.stats.find(fun),
                                    br = b.stats.find(fun);
                                if ( !ar || !br || ar.value === br.value )
                                    continue;
                                const av = parseInt(ar.value), bv = parseInt(br.value);
                                return c.sort == 1 ? av - bv : bv - av;
                            }
                            return 0;
                        });
                        
                        ctrr.showResult(res, {statShowList: search_list});
                    }

                    const search_result_scope = createSearchButtonScope(search_listener);
                    btn_scope.appendChild(search_result_scope);
                    
                    const tips_scope = simpleCreateHTML('div', 'tips-scope');
                    [
                        {name: 'down', icon: ICONS.down},
                        {name: 'up', icon: ICONS.up},
                        {name: 'none', icon: ICONS.hline}
                    ].forEach(a => {
                        tips_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small'], a.icon + '<span class="text">' + Lang('tips/sort: ' +　a.name) + '</span>'));
                    });

                    frg.appendChild(stats_scope);
                    frg.appendChild(tips_scope);
                    frg.appendChild(btn_scope);
                }
                break;
                case 'item-level': {
                    function input_click(e){
                        this.select();
                    }
                    const search_scope = simpleCreateHTML('div', 'search-scope');
                    const input1 = simpleCreateHTML('input', ['search', 'short'], null, {'type': 'number'});
                    const input2 = simpleCreateHTML('input', ['search', 'short'], null, {'type': 'number'});
                    input1.addEventListener('click', input_click);
                    input2.addEventListener('click', input_click);
                    search_scope.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'title'], '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1250pt" height="1250pt" viewBox="0 0 1250 1250" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,1250) scale(0.1,-0.1)" fill="#000000" stroke="none"><path d="M1468 11473 c-29 -34 -57 -98 -75 -173 -15 -62 -18 -111 -16 -277 l2 -201 -102 34 c-112 38 -148 42 -168 18 -15 -18 -20 -114 -8 -164 4 -19 15 -100 24 -180 56 -495 128 -757 306 -1113 76 -153 214 -396 234 -412 7 -6 78 -141 158 -300 364 -728 566 -1026 995 -1466 l163 -168 -50 -203 c-137 -556 -160 -746 -168 -1370 l-5 -428 -55 -82 c-70 -108 -155 -259 -203 -361 -96 -210 -132 -392 -146 -743 l-7 -159 27 -32 c67 -80 199 -105 317 -59 37 14 69 22 73 19 3 -3 8 2 12 11 3 9 15 16 25 16 10 0 62 11 115 25 102 27 198 71 252 118 l34 28 62 -133 c35 -73 79 -160 99 -193 l35 -60 -221 -6 c-231 -6 -245 -8 -492 -40 -169 -23 -172 -23 -310 -44 -354 -53 -385 -59 -435 -85 -45 -23 -42 -7 -42 -205 0 -139 -13 -216 -66 -397 -33 -112 -30 -132 28 -159 33 -16 55 -15 368 12 389 32 865 65 1177 79 264 13 1155 6 1345 -9 74 -6 218 -18 320 -26 221 -19 532 -53 920 -101 157 -19 292 -36 300 -36 8 0 107 9 220 21 113 11 230 23 260 26 30 3 150 14 265 24 950 88 1527 101 2285 51 204 -14 768 -65 993 -91 150 -17 181 -18 205 -7 30 15 28 -14 15 253 -5 103 -2 140 21 264 24 132 25 146 11 167 -8 13 -24 24 -34 24 -10 0 -72 13 -137 29 -467 115 -798 166 -1299 201 -88 7 -183 15 -211 18 l-52 7 80 95 c111 131 206 278 295 455 42 82 77 152 79 154 2 2 31 -19 66 -46 152 -120 255 -176 398 -218 52 -15 163 -61 245 -100 173 -84 230 -105 286 -105 73 0 119 41 148 130 10 32 6 47 -43 175 -168 435 -316 713 -586 1103 -127 183 -128 184 -134 332 -2 63 -7 122 -9 130 -3 8 -11 94 -17 190 -10 158 -18 263 -36 445 -3 33 -12 112 -20 175 -9 63 -18 144 -21 180 -3 36 -9 70 -13 75 -4 6 -13 39 -20 75 -16 81 -73 261 -114 360 -30 72 -31 76 -16 107 8 18 50 68 93 111 42 43 77 86 77 94 0 9 25 41 55 72 30 30 55 59 55 63 1 15 196 243 397 465 155 171 503 524 658 669 154 143 526 469 739 649 293 248 381 320 387 320 10 0 119 180 119 197 0 8 5 23 10 34 23 42 -16 69 -124 89 -33 5 -61 12 -63 13 -2 2 17 22 43 43 72 61 142 134 147 154 7 27 -18 56 -51 63 -52 10 -661 67 -822 76 -219 13 -695 5 -870 -14 -571 -62 -1039 -208 -1763 -551 -295 -140 -1053 -539 -1090 -573 -16 -16 -24 -16 -80 -5 -399 82 -658 113 -957 114 -287 2 -542 -22 -1110 -104 l-235 -34 -110 70 c-194 125 -241 156 -658 427 -423 275 -994 659 -1350 908 -230 161 -773 557 -1107 808 -118 89 -225 167 -237 173 -31 17 -68 15 -85 -5z"/></g></svg>' + '<span class="text">' + Lang('item detail/create/item level') + '</span>'));
                    search_scope.appendChild(simpleCreateHTML('span', 'icon-before-short', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'));
                    search_scope.appendChild(input1);
                    search_scope.appendChild(simpleCreateHTML('span', ['text', 'inner'], '~'));
                    search_scope.appendChild(input2);
                    frg.appendChild(search_scope);

                    const btn_scope = createButtonScope();

                    const search_category_ul = createSearchCategoryScope();
                    btn_scope.appendChild(createButtonScopeTitle('category'));
                    btn_scope.appendChild(search_category_ul);

                    function search_listener(e){
                        const res = [];
                        let min = input1.value, max = input2.value;
                        if ( max === '' && min === '' )
                            return;
                        const maxv = 300, minv = 0;
                        const valiV = t => {
                            t = parseInt(t);
                            if ( t > maxv )
                                t = maxv;
                            if ( t < minv )
                                t = minv;
                            return t;
                        };
                        if ( max === '' )
                            max = maxv;
                        if ( min === '' )
                            min = minv;

                        max = valiV(max);
                        min = valiV(min);

                        if ( max < min ){
                            const t = max;
                            max = min;
                            min = t;
                        }
                        input1.value = min;
                        input2.value = max;

                        ctrr.parent.items.equipments.forEach(item => {
                            if ( res.length == ctrr.status.resultMaximum )
                                return;
                            if ( !item.recipe )
                                return;
                            if ( !checkItemCategory(search_category_ul, item) )
                                return;
                            const v = parseInt(item.recipe['item_level'], 10);
                            if ( Number.isNaN(v) )
                                return;
                            const check = v >= min && v < max;
                            
                            if ( check )
                                res.push(item);
                        });

                        res.sort((a, b) => parseInt(a.recipe['item_level'], 10) - parseInt(b.recipe['item_level'], 10));
                        
                        ctrr.showResult(res, {showItemLevel: true});
                    }

                    const search_result_scope = createSearchButtonScope(search_listener);
                    btn_scope.appendChild(search_result_scope);

                    frg.appendChild(btn_scope);
                }
            }
            const scope = simpleCreateHTML('div', 'options-' + p);
            scope.appendChild(frg);
            if ( i != 0 )
                scope.classList.add('hidden');
            opts.appendChild(scope);
        });

        const res_scope = simpleCreateHTML('div', 'result');
        this.nodes.result = res_scope;

        const detail = simpleCreateHTML('div', ['detail', 'hidden']);
        {
            const top = simpleCreateHTML('div', 'top');
            const name = simpleCreateHTML('span', 'name');

            const close = simpleCreateHTML('span', ['button', 'right'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>');
            close.addEventListener('click', function(e){
                ctrr.nodes.detail.classList.add('hidden');
            });

            const unfold = simpleCreateHTML('span', ['button', 'right'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 5.83l2.46 2.46c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 3.7c-.39-.39-1.02-.39-1.41 0L8.12 6.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 5.83zm0 12.34l-2.46-2.46c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.17 3.18c.39.39 1.02.39 1.41 0l3.17-3.17c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 18.17z"/></svg>');
            unfold.addEventListener('click', function(e){
                detail.classList.toggle('unfold');
                this.innerHTML = detail.classList.contains('unfold')
                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path opacity=".87" fill="none" d="M24 0v24H0V0h24z"/><path d="M8.12 19.3c.39.39 1.02.39 1.41 0L12 16.83l2.47 2.47c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-3.17-3.17c-.39-.39-1.02-.39-1.41 0l-3.17 3.17c-.4.38-.4 1.02-.01 1.41zm7.76-14.6c-.39-.39-1.02-.39-1.41 0L12 7.17 9.53 4.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.03 0 1.42l3.17 3.17c.39.39 1.02.39 1.41 0l3.17-3.17c.4-.39.4-1.03.01-1.42z"/></svg>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 5.83l2.46 2.46c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 3.7c-.39-.39-1.02-.39-1.41 0L8.12 6.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 5.83zm0 12.34l-2.46-2.46c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.17 3.18c.39.39 1.02.39 1.41 0l3.17-3.17c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 18.17z"/></svg>';
            });

            top.appendChild(name);
            top.appendChild(close);
            top.appendChild(unfold);
            detail.appendChild(top);
        }
        detail.appendChild(simpleCreateHTML('div', 'contents'));

        this.nodes.detail = detail;

        main_node.appendChild(opts_menu)
        main_node.appendChild(opts);
        main_node.appendChild(res_scope);
        main_node.appendChild(detail);
    }
    showResult(res, config){
        config = Object.assign({
            statShowList: [],
            showItemLevel: false
        }, config);

        const frg = document.createDocumentFragment();
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        if ( res.length != 0 ){
            const ctrr = this;
            function top_listener(e){
                const index = parseInt(this.getAttribute('data-i'), 10);
                ctrr.showItemDetail(res[index]);
            }

            res.forEach((p, i) => {
                const scope = simpleCreateHTML('div', 'scope');
                const top = simpleCreateHTML('div', 'top', null, {'data-i': i});
                const name = simpleCreateHTML('div', 'name', p.name);
                top.appendChild(name);
                scope.appendChild(top);
                top.addEventListener('click', top_listener);

                const sub = simpleCreateHTML('div', 'sub');
                const cat = simpleCreateHTML('span', ['text-small', 'category'], p.category != -1 ? Lang('Equipmemt Category list')[p.category] : Lang('item detail/unknow'));

                if ( p.obtains.length <= 1 ){
                    const t = p.obtains.length != 0 ? Lang('item detail/obtains/' + p.obtains[0].type) : Lang('item detail/obtains/unknow');
                    const obtain = simpleCreateHTML('span', ['text-small', 'obtain'], t);
                    sub.appendChild(obtain);
                }
                sub.appendChild(cat);
                scope.appendChild(sub);

                if ( config.statShowList.length != 0 ){
                    const stat_scope = simpleCreateHTML('div', 'search-stat-scope');
                    const negativeFunction = v => '<span class="dark">' + v + '</span>';
                    config.statShowList.forEach(a => {
                        const t = p.stats.find(b => b.baseName() == a.baseName && b.type == a.type);
                        if ( t )
                            stat_scope.appendChild(simpleCreateHTML('span', 'search-stat', t.show({processNegativeValue: negativeFunction})));
                    });
                    scope.appendChild(stat_scope);
                }
                const attr_scope = simpleCreateHTML('div', 'attribute-scope');
                const createAttrHTML = (n, v) => simpleCreateHTML('div', 'attribute', `<span class="title">${n}</span><span class="value">${v}</span>`);
                if ( config.showItemLevel ){
                    let t;
                    if ( p.recipe )
                        t = p.recipe['item_level'] || '?';
                    else
                        t = '?';
                    attr_scope.appendChild(createAttrHTML(Lang('item detail/create/item level'), t));
                }

                if ( attr_scope.childElementCount != 0 )
                    scope.appendChild(attr_scope);

                frg.appendChild(scope);
            });
        }
        else
            frg.appendChild(simpleCreateHTML('div', 'no-result', Lang('No Result')));

        CY.element.removeAllChild(this.nodes.result);
        this.nodes.result.appendChild(frg);
    }
    showItemDetail(item){
        const simpleCreateHTML = CY.element.simpleCreateHTML;
        function createTitle(n, v){
            let t = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1250pt" height="1250pt" viewBox="0 0 1250 1250" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,1250) scale(0.1,-0.1)" fill="#000000" stroke="none"><path d="M1468 11473 c-29 -34 -57 -98 -75 -173 -15 -62 -18 -111 -16 -277 l2 -201 -102 34 c-112 38 -148 42 -168 18 -15 -18 -20 -114 -8 -164 4 -19 15 -100 24 -180 56 -495 128 -757 306 -1113 76 -153 214 -396 234 -412 7 -6 78 -141 158 -300 364 -728 566 -1026 995 -1466 l163 -168 -50 -203 c-137 -556 -160 -746 -168 -1370 l-5 -428 -55 -82 c-70 -108 -155 -259 -203 -361 -96 -210 -132 -392 -146 -743 l-7 -159 27 -32 c67 -80 199 -105 317 -59 37 14 69 22 73 19 3 -3 8 2 12 11 3 9 15 16 25 16 10 0 62 11 115 25 102 27 198 71 252 118 l34 28 62 -133 c35 -73 79 -160 99 -193 l35 -60 -221 -6 c-231 -6 -245 -8 -492 -40 -169 -23 -172 -23 -310 -44 -354 -53 -385 -59 -435 -85 -45 -23 -42 -7 -42 -205 0 -139 -13 -216 -66 -397 -33 -112 -30 -132 28 -159 33 -16 55 -15 368 12 389 32 865 65 1177 79 264 13 1155 6 1345 -9 74 -6 218 -18 320 -26 221 -19 532 -53 920 -101 157 -19 292 -36 300 -36 8 0 107 9 220 21 113 11 230 23 260 26 30 3 150 14 265 24 950 88 1527 101 2285 51 204 -14 768 -65 993 -91 150 -17 181 -18 205 -7 30 15 28 -14 15 253 -5 103 -2 140 21 264 24 132 25 146 11 167 -8 13 -24 24 -34 24 -10 0 -72 13 -137 29 -467 115 -798 166 -1299 201 -88 7 -183 15 -211 18 l-52 7 80 95 c111 131 206 278 295 455 42 82 77 152 79 154 2 2 31 -19 66 -46 152 -120 255 -176 398 -218 52 -15 163 -61 245 -100 173 -84 230 -105 286 -105 73 0 119 41 148 130 10 32 6 47 -43 175 -168 435 -316 713 -586 1103 -127 183 -128 184 -134 332 -2 63 -7 122 -9 130 -3 8 -11 94 -17 190 -10 158 -18 263 -36 445 -3 33 -12 112 -20 175 -9 63 -18 144 -21 180 -3 36 -9 70 -13 75 -4 6 -13 39 -20 75 -16 81 -73 261 -114 360 -30 72 -31 76 -16 107 8 18 50 68 93 111 42 43 77 86 77 94 0 9 25 41 55 72 30 30 55 59 55 63 1 15 196 243 397 465 155 171 503 524 658 669 154 143 526 469 739 649 293 248 381 320 387 320 10 0 119 180 119 197 0 8 5 23 10 34 23 42 -16 69 -124 89 -33 5 -61 12 -63 13 -2 2 17 22 43 43 72 61 142 134 147 154 7 27 -18 56 -51 63 -52 10 -661 67 -822 76 -219 13 -695 5 -870 -14 -571 -62 -1039 -208 -1763 -551 -295 -140 -1053 -539 -1090 -573 -16 -16 -24 -16 -80 -5 -399 82 -658 113 -957 114 -287 2 -542 -22 -1110 -104 l-235 -34 -110 70 c-194 125 -241 156 -658 427 -423 275 -994 659 -1350 908 -230 161 -773 557 -1107 808 -118 89 -225 167 -237 173 -31 17 -68 15 -85 -5z"/></g></svg><span class="text">' + Lang('item detail/scope title/' + n) + '</span>';
            if ( v )
                t += '<span class="title-value">' + v + '</span>'
            return simpleCreateHTML('div', 'scope-title', t);
        }

        const r = this.nodes.detail;
        const name = r.querySelector('.top > .name');
        const contents = r.querySelector('.contents');
        CY.element.removeAllChild(contents);

        name.innerHTML = item.name;

        const cat = item.category;
        contents.appendChild(createTitle([10, 12, 13, 14].indexOf(cat) == -1 ? 'base atk' : 'base def', item.baseValue));
        if ( item.baseStability )
            contents.appendChild(createTitle('base stability', item.baseStability + '%'));

        if ( item.stats.length != 0 ){
            const stats = simpleCreateHTML('div', ['scope', 'stats']);
            item.stats.forEach((a, i) => {
                const rst_frg = document.createDocumentFragment();
                if ( item.statRestrictions[i] !== '' ){
                    item.statRestrictions[i].split(/\s*,\s*/).forEach(rst => {
                        const t = Lang('item detail/restriction/' + rst);
                        rst_frg.appendChild(simpleCreateHTML('span', 'restriction', t));
                    });
                }
                const negativeFunction = v => '<span class="dark">' + v + '</span>';
                const span = simpleCreateHTML('span', null, a.show({processNegativeValue: negativeFunction}));
                if ( rst_frg.childElementCount != 0 )
                    span.appendChild(rst_frg);
                stats.appendChild(span);
            });
            contents.appendChild(createTitle('stats'));
            contents.appendChild(stats);
        }
        if ( item.recipe ){
            const rc = item.recipe;
            if ( rc['potential'] ){
                const create = simpleCreateHTML('div', ['scope', 'create']);
                
                const lv = rc['item_level'],
                    dif = rc['item_difficulty'];

                const tb = document.createElement('tbody');
                tb.innerHTML = `<tr>
                    <td class="title">${Lang('item detail/create/item level')}</td>
                    <td class="value">${lv !== void 0 && lv !== '' ? lv : '?'}</td>
                </tr><tr>
                    <td class="title">${Lang('item detail/create/item difficulty')}</td>
                    <td class="value">${dif !== void 0 && dif !== '' ? dif : '?'}</td>
                </tr>`;
                const table = document.createElement('table');
                table.appendChild(tb);
                contents.appendChild(createTitle('create', rc['potential']));
                create.appendChild(table);
                contents.appendChild(create);
            }
            if ( rc['materials'] ){
                const mats = rc['materials'];
                const tb = document.createElement('tbody');
                let html = '';
                mats.forEach(a => {
                    const v = a.quantity;
                    html += `<tr>
                        <td class="title">${a.name}</td>
                        <td class="value">${v !== void 0 && v !== '' ? v : '?'}</td>
                    </tr>`;
                });
                if ( rc['cost'] !== void 0 ){
                    const v = rc['cost'];
                    html += `<tr>
                        <td class="title">${Lang('item detail/spina')}</td>
                        <td class="value">${v !== '' ? v : '?'}s</td>
                    </tr>`; 
                }
                tb.innerHTML = html;
                const table = document.createElement('table');
                table.appendChild(tb);

                const mats_scope = simpleCreateHTML('div', ['scope', 'materials']);
                mats_scope.appendChild(table);
                contents.appendChild(createTitle('materials'));
                contents.appendChild(mats_scope);
            }
        }
        const obtains = simpleCreateHTML('div', ['scope', 'obtains']);
        item.obtains.forEach(a => {
            const scp = simpleCreateHTML('div', 'obtain-scope');
            const t = Lang('item detail/obtains/' + a.type);
            const s1 = simpleCreateHTML('div', 'title');
            s1.appendChild(simpleCreateHTML('span', 'type', t));
            s1.appendChild(simpleCreateHTML('span', 'name', a.type != 'smith' ? (a['name'] || '?') : Lang('item detail/obtains/create equipment')));
            scp.appendChild(s1);
            
            scp.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'info-line'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/><path d="M0 0h24v24H0z" fill="none"/></svg><span class="text">' + (a.type != 'smith' ? (a['map'] || '?') : Lang('item detail/obtains/all smith')) + '</span>'));
            if ( a['dye'] )
                scp.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'info-line'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg><span class="text">' + a['dye'] + '</span>'));
            obtains.appendChild(scp);
        });
        if ( item.obtains.length == 0 )
            obtains.innerHTML = '<div class="no-data">' + Lang('item detail/obtains/no data') + '</div>';
        contents.appendChild(createTitle('obtains'));
        contents.appendChild(obtains);

        r.classList.remove('hidden');
    }
}