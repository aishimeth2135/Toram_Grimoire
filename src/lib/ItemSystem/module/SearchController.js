import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";
import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";
import Icons from "../../main/module/SvgIcons.js";


function Lang(s, vs) {
  return GetLang('Item Query/Search/' + s, vs);
}

export default class SearchController {
  constructor(parent) {
    this.parent = parent;
    this.nodes = {
      result: null,
      optionsScope: null
    };
    this.status = {
      resultMaximum: 100,
      showDetailTargetDye: null
    };
  }
  init(main_node) {
    const simpleCreateHTML = CY.element.simpleCreateHTML;
    const opts_menu = simpleCreateHTML('ul', 'options-menu');
    const opts = simpleCreateHTML('div', 'options-scope');
    this.nodes.optionsScope = opts;

    const ctrr = this;

    function createButtonScope() {
      return simpleCreateHTML('div', 'button-scope');
    }

    function createSearchButtonScope(lis, options) {
      options = Object.assign({
        dyeOnly: false
      }, options);
      const t = simpleCreateHTML('div', 'search-button-scope');
      const search_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], Icons('iconify/ant-design:search-outlined') + '<span class="text">' + Lang('search') + '</span>');
      search_btn.addEventListener('click', lis);
      t.appendChild(search_btn);

      if (options.dyeOnly) {
        const dyeOnly_search_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'],
          Icons('iconify/ant-design:search-outlined') + '<span class="text">' + Lang('search: dye only') + '</span>', { 'data-dye-only': '1' });
        dyeOnly_search_btn.addEventListener('click', lis);
        t.appendChild(dyeOnly_search_btn);
      }

      return t;
    }

    function createSearchCategoryScope() {
      const t = simpleCreateHTML('ul', 'search-category');
      Lang('Equipmemt Category list').forEach((p, i) => {
        const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'cur'], p, { 'data-i': i });
        li.addEventListener('click', toggle_select_listener);
        t.appendChild(li);
      });
      return t;
    }

    function checkItemCategory(node, item) {
      const l = getSelectedOptions(node, 'data-i').map(a => parseInt(a));
      return l.indexOf(item.category) != -1;
    }

    function createSearchObtainTypeScope() {
      const t = simpleCreateHTML('ul', 'search-category-type');
      ['smith', 'boss', 'mini_boss', 'mobs', 'quest', 'box', 'exchange', 'other'].forEach(a => {
        const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'cur'], Lang('item detail/obtains/' + a), { 'data-type': a });
        li.addEventListener('click', toggle_select_listener);
        t.appendChild(li);
      });
      return t;
    }

    function checkItemObtainType(node, item) {
      const l = getSelectedOptions(node, 'data-type');
      return item.obtains.find(a => l.indexOf(a['type']) != -1);
    }

    function toggle_select_listener(e) {
      this.classList.toggle('cur');
    }

    function getSelectedOptions(node, data_name) {
      return Array.from(node.querySelectorAll('.cur'))
        .map(typeof data_name === 'function' ? data_name : a => a.getAttribute(data_name));
    }

    function selectAllOption_listener(e) {
      this.parentNode.nextSibling.querySelectorAll('li').forEach(a => a.classList.add('cur'));
    }

    function cancelAllOption_listener(e) {
      this.parentNode.nextSibling.querySelectorAll('li.cur').forEach(a => a.classList.remove('cur'));
    }

    function createButtonScopeTitle(name) {
      const t = simpleCreateHTML('div', ['Cyteria', 'Layout', 'flex-vertical-middle', 'title-scope']);
      t.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'title'], Icons('multiple-blank-circle') + `<span class="text">${Lang('option scope title/' + name)}</span>`));
      const sel_all = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'text-small'], Icons('iconify/mdi:select-all') + '<span class="text">' + Lang('option scope title/button/select all') + '</span>');
      sel_all.addEventListener('click', selectAllOption_listener);
      const cel_all = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'text-small'], Icons('close') + '<span class="text">' + Lang('option scope title/button/cancel all') + '</span>');
      cel_all.addEventListener('click', cancelAllOption_listener);
      t.appendChild(sel_all);
      t.appendChild(cel_all);
      return t;
    }

    function closeWindow_listener(e) {
      this.parentNode.parentNode.classList.add('hidden');
    }

    function showSearchCaption_listener(e) {
      if (showSearchCaption.classList.contains('hidden')) {
        const cat = opts_menu.querySelector('.cur').getAttribute('data-category');
        const list = Lang('Show Search Caption/caption: ' + cat);
        const ul = simpleCreateHTML('ul', ['Cyteria', 'ul', 'simple']);
        list.forEach(a => {
          a = a
            .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (...args) => `<span class="light">${args[1]}</span>`)
            .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (...args) => `<span class="separate-text light">${args[1]}</span>`);
          ul.appendChild(simpleCreateHTML('li', null, a))
        });

        const ct = showSearchCaption.querySelector('.content');
        CY.element.removeAllChild(ct);
        ct.appendChild(ul);
        showSearchCaption.classList.remove('hidden');
      } else
        showSearchCaption.classList.add('hidden');
    }

    function createShowSearchCaptionButton() {
      const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('help-rhombus'));
      btn.addEventListener('click', showSearchCaption_listener);
      return btn;
    }

    const showSearchCaption = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'pop-right', 'show-search-caption', 'hidden']); {
      const top = simpleCreateHTML('div', 'top');
      const name = simpleCreateHTML('span', 'name', Lang('Show Search Caption/title'));

      const close = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button', 'start'], Icons('close'));
      close.addEventListener('click', closeWindow_listener);

      top.appendChild(name);
      top.appendChild(close);
      showSearchCaption.appendChild(top);

      showSearchCaption.appendChild(simpleCreateHTML('div', 'content'));
    }
    main_node.appendChild(showSearchCaption);



    function li_listener(e) {
      const c = this.getAttribute('data-category');
      const scope = ctrr.nodes.optionsScope.querySelector('.options-' + c);
      const cur = this.parentNode.querySelector('.cur');
      if (cur) {
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
      const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], Lang('options menu/' + p), { 'data-category': p });
      opts_menu.appendChild(li);
      li.addEventListener('click', li_listener);
      if (i == 0)
        li.classList.add('cur');

      const frg = document.createDocumentFragment();
      switch (p) {
        case 'main':
          {
            const search_scope = simpleCreateHTML('div', ['Cyteria', 'Layout', 'title-input-scope', 'search-scope']);
            const input = simpleCreateHTML('input', 'search', null, { 'placeholder': Lang('search placeholder') });
            search_scope.appendChild(simpleCreateHTML('span', 'icon', Icons('iconify/ic:twotone-search')));
            search_scope.appendChild(input);
            search_scope.appendChild(createShowSearchCaptionButton());
            frg.appendChild(search_scope);

            const search_result_scope = createSearchButtonScope(search_listener, { dyeOnly: true });
            search_scope.appendChild(search_result_scope);

            const btn_scope = createButtonScope();

            const search_by_ul = simpleCreateHTML('ul', 'search-by');
            ['name', 'material', 'dye', 'obtain-name'].forEach(a => {
              const _li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], Lang('options: main/search by: ' + a), { 'data-name': a });
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

            function search_listener(e) {
              // if ( input.value === '' )
              //     return;
              const searchList = getSelectedOptions(search_by_ul, 'data-name');
              const res = [];
              const ov = input.value.toLowerCase();
              const search_values = ov.split(/\s*,\s*/);
              ctrr.parent.items.equipments.find(item => {
                if (res.length == ctrr.status.resultMaximum)
                  return true;
                if (!checkItemCategory(search_category_ul, item) || !checkItemObtainType(search_obtain_type_ul, item))
                  return;
                if (input.value !== '') {
                  const check = search_values.find(v => {
                    return searchList.find(a => {
                      switch (a) {
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
                  if (check)
                    res.push(item);
                } else
                  res.push(item);
              });
              ctrr.status.showDetailTargetDye = this.getAttribute('data-dye-only') == '1' ? search_values.slice() : null;
              ctrr.showResult(res);
            }

            frg.appendChild(btn_scope);
          }
          break;
        case 'stat':
          {
            const stats_scope = simpleCreateHTML('div', 'stats-scope');

            const search_scope = simpleCreateHTML('div', ['Cyteria', 'Layout', 'title-input-scope', 'search-scope']);
            const input = simpleCreateHTML('input', 'search', null, { 'placeholder': Lang('search placeholder') });
            search_scope.appendChild(simpleCreateHTML('span', 'icon', Icons('iconify/ic:twotone-search')));
            search_scope.appendChild(input);
            search_scope.appendChild(createShowSearchCaptionButton());
            frg.appendChild(search_scope);

            const search_result_scope = createSearchButtonScope(search_listener);
            search_scope.appendChild(search_result_scope);

            input.addEventListener('change', function(e) {
              if (input.value === '')
                return;
              const stats_scope_list = stats_scope.querySelectorAll('.stat');
              stats_scope_list.forEach(a => a.classList.remove('cur'));
              const _v = input.value.toLowerCase();
              const l = _v.split(/\s*,\s*/);
              let has = false;
              stats_scope_list.forEach(a => {
                if (_v == '@all') {
                  a.classList.remove('hidden');
                  return;
                }
                const t = a.querySelector('.text').innerHTML;
                if (l.find(b => t.toLowerCase().includes(b))) {
                  a.classList.remove('hidden');
                  has = true;
                } else
                  a.classList.add('hidden');
              });
              if (has)
                stat_scope_tips.classList.add('hidden');
              else {
                stat_scope_tips.classList.remove('hidden');
                stat_scope_tips.innerHTML = Lang('tips/stats search: no result');
              }
            });

            const statList = Grimoire.CharacterSystem.statList;

            function switch_sort(e) {
              const t = parseInt(this.parentNode.getAttribute('data-sort'));
              this.parentNode.setAttribute('data-sort', ['1', '2', '0'][t]);
              this.innerHTML = [
                Icons('arrow-up'),
                Icons('sub'),
                Icons('arrow-down')
              ][t];
              e.stopPropagation();
            }
            statList.forEach(a => {
              [0, 1].forEach(b => {
                if (b == 1 && !a.hasMultiplier)
                  return;
                const stat = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'icon-fill', 'stat', 'hidden'], null, {
                  'data-sort': '0',
                  'data-bn': a.baseName,
                  'data-type': b
                });
                stat.addEventListener('click', toggle_select_listener);
                stat.appendChild(simpleCreateHTML('span', 'text', a.title(b == 0 ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER)));
                const toggle_sort_btn = simpleCreateHTML('span', ['icon', 'sort'], Icons('arrow-down'));
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

            function search_listener(e) {
              const search_list = getSelectedOptions(stats_scope, a => {
                return {
                  baseName: a.getAttribute('data-bn'),
                  sort: parseInt(a.getAttribute('data-sort'), 10),
                  type: a.getAttribute('data-type') === '0' ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER
                }
              });

              if (search_list.length == 0)
                return;

              const res = [];

              ctrr.parent.items.equipments.forEach(item => {
                if (res.length == ctrr.status.resultMaximum)
                  return;
                if (!checkItemCategory(search_category_ul, item) || !checkItemObtainType(search_obtain_type_ul, item))
                  return;
                const check = search_list.every(a => item.stats.find(b => a.baseName == b.baseName() && a.type == b.type));
                if (check)
                  res.push(item);
              });
              res.sort((a, b) => {
                for (let i = 0; i < search_list.length; ++i) {
                  const c = search_list[i];
                  if (c.sort == 2)
                    continue;
                  const fun = q => q.baseName() == c.baseName && q.type == c.type;
                  const ar = a.stats.find(fun),
                    br = b.stats.find(fun);
                  if (!ar || !br || ar.value === br.value)
                    continue;
                  const av = parseInt(ar.value),
                    bv = parseInt(br.value);
                  return c.sort == 1 ? av - bv : bv - av;
                }
                return 0;
              });

              ctrr.showResult(res, { statShowList: search_list });
            }

            const tips_scope = simpleCreateHTML('div', 'tips-scope');
            [
              { name: 'down', icon: Icons('arrow-down') },
              { name: 'up', icon: Icons('arrow-up') },
              { name: 'none', icon: Icons('sub') }
            ]
            .forEach(a => {
              tips_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small'], a.icon + '<span class="text">' + Lang('tips/sort: ' + a.name) + '</span>'));
            });

            frg.appendChild(stats_scope);
            frg.appendChild(tips_scope);
            frg.appendChild(btn_scope);
          }
          break;
        case 'item-level':
          {
            function input_click(e) {
              this.select();
            }
            const search_scope = simpleCreateHTML('div', ['Cyteria', 'Layout', 'title-input-scope', 'search-scope']);
            const input1 = simpleCreateHTML('input', ['search', 'short'], null, { 'type': 'number' });
            const input2 = simpleCreateHTML('input', ['search', 'short'], null, { 'type': 'number' });
            input1.addEventListener('click', input_click);
            input2.addEventListener('click', input_click);
            search_scope.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'text-small', 'line', 'title'], Icons('multiple-blank-circle') + '<span class="text">' + Lang('item detail/create/item level') + '</span>'));
            search_scope.appendChild(simpleCreateHTML('span', 'icon-before-short', Icons('iconify/ic:twotone-search')));
            search_scope.appendChild(input1);
            search_scope.appendChild(simpleCreateHTML('span', ['text', 'inner'], '~'));
            search_scope.appendChild(input2);
            search_scope.appendChild(createShowSearchCaptionButton());
            frg.appendChild(search_scope);

            const search_result_scope = createSearchButtonScope(search_listener);
            search_scope.appendChild(search_result_scope);

            const btn_scope = createButtonScope();

            const search_category_ul = createSearchCategoryScope();
            btn_scope.appendChild(createButtonScopeTitle('category'));
            btn_scope.appendChild(search_category_ul);

            function search_listener(e) {
              const res = [];
              let min = input1.value,
                max = input2.value;
              if (max === '' && min === '')
                return;
              const maxv = 300,
                minv = 0;
              const valiV = t => {
                t = parseInt(t);
                if (t > maxv)
                  t = maxv;
                if (t < minv)
                  t = minv;
                return t;
              };
              if (max === '')
                max = maxv;
              if (min === '')
                min = minv;

              max = valiV(max);
              min = valiV(min);

              if (max < min) {
                const t = max;
                max = min;
                min = t;
              }
              input1.value = min;
              input2.value = max;

              ctrr.parent.items.equipments.forEach(item => {
                if (res.length == ctrr.status.resultMaximum)
                  return;
                if (!item.recipe)
                  return;
                if (!checkItemCategory(search_category_ul, item))
                  return;
                const v = parseInt(item.recipe['item_level'], 10);
                if (Number.isNaN(v))
                  return;
                const check = v >= min && v < max;

                if (check)
                  res.push(item);
              });

              res.sort((a, b) => parseInt(a.recipe['item_level'], 10) - parseInt(b.recipe['item_level'], 10));

              ctrr.showResult(res, { showItemLevel: true });
            }

            frg.appendChild(btn_scope);
          }
      }
      const scope = simpleCreateHTML('div', 'options-' + p);
      scope.appendChild(frg);
      if (i != 0)
        scope.classList.add('hidden');
      opts.appendChild(scope);
    });

    const res_scope = simpleCreateHTML('div', 'result');
    this.nodes.result = res_scope;

    const detail = simpleCreateHTML('div', ['Cyteria', 'window', 'top-right', 'h60', 'frozen-top', 'pop-right', 'detail', 'hidden']); {
      const top = simpleCreateHTML('div', 'top');
      const name = simpleCreateHTML('span', 'name');

      const unfold = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button', 'start'], Icons('iconify/ic:round-unfold-more'));
      unfold.addEventListener('click', function(e) {
        detail.classList.toggle('unfold');
        detail.classList.toggle('h60');
        this.innerHTML = detail.classList.contains('unfold') ?
          Icons('iconify/ic:round-unfold-less') :
          Icons('iconify/ic:round-unfold-more');
      });

      const close = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button'], Icons('close'));
      close.addEventListener('click', closeWindow_listener);

      top.appendChild(name);
      top.appendChild(unfold);
      top.appendChild(close);
      detail.appendChild(top);
    }
    detail.appendChild(simpleCreateHTML('div', 'contents'));

    this.nodes.detail = detail;

    main_node.appendChild(opts_menu)
    main_node.appendChild(opts);
    main_node.appendChild(res_scope);
    main_node.appendChild(detail);
  }
  showResult(res, config) {
    config = Object.assign({
      statShowList: [],
      showItemLevel: false
    }, config);

    const frg = document.createDocumentFragment();
    const simpleCreateHTML = CY.element.simpleCreateHTML;

    if (res.length != 0) {
      const ctrr = this;

      function item_listener(e) {
        const index = parseInt(this.getAttribute('data-i'), 10);
        ctrr.showItemDetail(res[index]);
      }

      res.forEach((p, i) => {
        const scope = simpleCreateHTML('div', 'scope', null, { 'data-i': i });
        const top = simpleCreateHTML('div', 'top', null);
        const name = simpleCreateHTML('div', 'name', p.name);
        top.appendChild(name);
        scope.appendChild(top);
        scope.addEventListener('click', item_listener);

        const sub = simpleCreateHTML('div', 'sub');
        const cat = simpleCreateHTML('span', ['text-small', 'category'], p.category != -1 ? Lang('Equipmemt Category list')[p.category] : Lang('item detail/unknow'));

        if (p.obtains.length <= 1) {
          const t = p.obtains.length != 0 ? Lang('item detail/obtains/' + p.obtains[0].type) : Lang('item detail/obtains/unknow');
          const obtain = simpleCreateHTML('span', ['text-small', 'obtain'], t);
          sub.appendChild(obtain);
        }
        sub.appendChild(cat);
        scope.appendChild(sub);

        if (config.statShowList.length != 0) {
          const stat_scope = simpleCreateHTML('div', 'search-stat-scope');
          const negativeFunction = v => '<span class="dark">' + v + '</span>';
          config.statShowList.forEach(a => {
            const t = p.stats.find(b => b.baseName() == a.baseName && b.type == a.type);
            if (t)
              stat_scope.appendChild(simpleCreateHTML('span', 'search-stat', t.show({ processNegativeValue: negativeFunction })));
          });
          scope.appendChild(stat_scope);
        }
        const attr_scope = simpleCreateHTML('div', 'attribute-scope');
        const createAttrHTML = (n, v) => simpleCreateHTML('div', 'attribute', `<span class="title">${n}</span><span class="value">${v}</span>`);
        if (config.showItemLevel) {
          let t;
          if (p.recipe)
            t = p.recipe['item_level'] || '?';
          else
            t = '?';
          attr_scope.appendChild(createAttrHTML(Lang('item detail/create/item level'), t));
        }

        if (attr_scope.childElementCount != 0)
          scope.appendChild(attr_scope);

        frg.appendChild(scope);
      });
    } else
      frg.appendChild(simpleCreateHTML('div', 'no-result', Lang('No Result')));

    CY.element.removeAllChild(this.nodes.result);
    this.nodes.result.appendChild(frg);
  }
  showItemDetail(item) {
    const simpleCreateHTML = CY.element.simpleCreateHTML;

    function createTitle(icon_id, n, v) {
      let t = Icons(icon_id) + '<span class="text">' + Lang('item detail/scope title/' + n) + '</span>';
      if (v)
        t += '<span class="value title-value">' + v + '</span>'
      return simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'line', 'text-small', 'scope-title'], t);
    }

    const r = this.nodes.detail;
    const name = r.querySelector('.top > .name');
    const contents = r.querySelector('.contents');
    CY.element.removeAllChild(contents);

    name.innerHTML = item.name;

    const cat = item.category;
    contents.appendChild(createTitle('sword', [10, 12, 13, 14].indexOf(cat) == -1 ? 'base atk' : 'base def', item.baseValue));
    if (item.baseStability)
      contents.appendChild(createTitle('sword', 'base stability', item.baseStability + '%'));

    if (item.stats.length != 0) {
      const stats = simpleCreateHTML('div', ['scope', 'stats']);
      const statDatas = item.stats.map((p, i) => ({
        origin: p,
        restriction: item.statRestrictions[i]
      }));
      statDatas.sort((a, b) => a.origin.base.order - b.origin.base.order);

      statDatas.forEach(p => {
        const rst_frg = document.createDocumentFragment();
        if (p.restriction !== '') {
          p.restriction.split(/\s*,\s*/).forEach(rst => {
            const t = Lang('item detail/restriction/' + rst);
            rst_frg.appendChild(simpleCreateHTML('span', 'restriction', t));
          });
        }
        const negativeFunction = v => '<span class="dark">' + v + '</span>';
        const span = simpleCreateHTML('span', null, p.origin.show({ processNegativeValue: negativeFunction }));
        if (rst_frg.childElementCount != 0)
          span.appendChild(rst_frg);
        stats.appendChild(span);
      });
      contents.appendChild(createTitle('book', 'stats'));
      contents.appendChild(stats);
    }
    if (item.recipe) {
      const rc = item.recipe;
      if (rc['potential']) {
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
        contents.appendChild(createTitle('book', 'create', rc['potential']));
        create.appendChild(table);
        contents.appendChild(create);
      }
      if (rc['materials']) {
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
        if (rc['cost'] !== void 0) {
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
        contents.appendChild(createTitle('cube-outline', 'materials'));
        contents.appendChild(mats_scope);
      }
    }
    const obtains = simpleCreateHTML('div', ['scope', 'obtains']);
    item.obtains.forEach(a => {
      if (this.status.showDetailTargetDye !== null && (!a['dye'] || !this.status.showDetailTargetDye.find(b => a['dye'].toLowerCase().includes(b))))
        return;
      const scp = simpleCreateHTML('div', 'obtain-scope');
      const t = Lang('item detail/obtains/' + a.type);
      const s1 = simpleCreateHTML('div', 'title');
      s1.appendChild(simpleCreateHTML('span', 'type', t));
      s1.appendChild(simpleCreateHTML('span', 'name', a.type != 'smith' ? (a['name'] || '?') : Lang('item detail/obtains/create equipment')));
      scp.appendChild(s1);

      scp.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'info-line'],
        Icons('iconify/mdi:map') + '<span class="text">' + (a.type != 'smith' ? (a['map'] || '?') : Lang('item detail/obtains/all smith')) + '</span>'));
      if (a['dye'])
        scp.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'info-line'], Icons('iconify/ic:round-color-lens') + '<span class="text">' + a['dye'] + '</span>'));
      obtains.appendChild(scp);
    });
    if (item.obtains.length == 0)
      obtains.innerHTML = '<div class="no-data">' + Lang('item detail/obtains/no data') + '</div>';
    contents.appendChild(createTitle('rhombus-split', 'obtains'));
    contents.appendChild(obtains);

    r.classList.remove('hidden');
  }
}