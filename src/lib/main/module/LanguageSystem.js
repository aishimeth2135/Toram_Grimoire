import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";
import zh_cn from "./LanguageData/zh_cn.js";

import CY from "./cyteria.js";

let currentLanguageNo = 0,
  secondLanguageNo = 1;

const LanguageData = {};

function AutoSetCurrentLanguage() {
  const lang = (window.navigator.language || window.navigator.userLanguage).toLowerCase();
  let no = 0;
  switch (lang) {
    case 'zh-tw':
    case 'zh-hk':
    case 'zh-sg':
      no = 1;
      break;
    case 'ja':
      no = 2;
      break;
    case 'zh-cn':
      no = 3;
      break;
  }
  currentLanguageNo = no;
}

function InitLanguageSystem() {
  // Init
  if (CY.storageAvailable('localStorage')) {
    // default
    if (!localStorage['app--language'])
      localStorage['app--language'] = 'auto';
    if (!localStorage['app--second-language'])
      localStorage['app--second-language'] = '0';

    const current_language_setting = localStorage['app--language'];
    if (current_language_setting == 'auto')
      AutoSetCurrentLanguage();
    else
      currentLanguageNo = parseInt(current_language_setting, 10);

    secondLanguageNo = parseInt(localStorage['app--second-language'], 10);
  } else
    AutoSetCurrentLanguage();

  Object.keys(LanguageData).forEach(k => delete LanguageData[k]);

  //
  InitLanguageData({ en, zh_tw, ja, zh_cn });
}

function SetLanguageData(target, obj) {
  Object.keys(obj).forEach(k => {
    const p = target[k];
    const q = obj[k];
    if (typeof q == 'object' && !Array.isArray(q)) {
      if (p === void 0)
        target[k] = {};
      SetLanguageData(target[k], q);
    } else if (typeof p != 'string' && !Array.isArray(p)) {
      target[k] = q;
    }
  });
}

function currentLanguage() {
  return currentLanguageNo;
}

function secondLanguage() {
  return secondLanguageNo;
}

function Search(lang, id) {
  id = id.split('/');
  let p = 0;
  let cur = lang;
  while (p !== id.length) {
    cur = cur[id[p]];
    ++p;
    if (cur === void 0)
      return void 0;
  }
  return cur;
}

function InitLanguageData(data) {
  // 傳入值是function，表示function回傳一個object。在此做前處理。
  Object.keys(data).forEach(k => {
    if (typeof data[k] == 'function')
      data[k] = data[k]();
  });

  const check = v => typeof v == 'object' && v !== null;

  const lang_names = ['en', 'zh_tw', 'ja', 'zh_cn'];
  const cur = data[lang_names[currentLanguage()]];

  if (check(cur))
    SetLanguageData(LanguageData, cur);
  if (currentLanguageNo != secondLanguageNo) {
    const snd = data[lang_names[secondLanguage()]];
    if (check(snd))
      SetLanguageData(LanguageData, snd);
  }
  lang_names.forEach((name, i) => {
    if (i == currentLanguage() || i == secondLanguage())
      return;
    const t = data[name];
    if (check(t))
      SetLanguageData(LanguageData, t);
  });
}

function GetLang(id, values) {
  let t = Search(LanguageData, id);
  if (t === void 0) {
    console.warn(`[Unknow Language data] id: ${id}`);
    console.log(new Error().stack);
    console.log(LanguageData);
    return '???';
  }

  if (Array.isArray(values))
    t = t.replace(/\$(\d+)/g, (v, i) => values[i] !== void 0 && values[i] !== null ? values[i] : '?');

  return t || '???';
}

function PageInitLanguage() {
  document.querySelectorAll("*[data-langid]").forEach(a => {
    a.innerHTML = GetLang(a.getAttribute('data-langid'));
    a.removeAttribute('data-langid');
  });
}

/**
 * replace original data with language data
 * @param {Array} datas           datas in the order of [[original], [current language], [second Language]]
 * @param {int}   index           current column index in csv data
 * @param {int}   data_index      row index of original data that be replace
 * @param {int}   lang_data_index row index of language data
 */
function HandleLanguageData(datas, data_index, lang_data_index) {
  const lang_datas = [datas[1], datas[2]];
  datas[0].forEach((p, index) => {
    const t = lang_datas
      .map(a => a && a[index] ? a[index][lang_data_index] : null)
      .find(t => t !== '' && t !== null && t !== void 0);
    if (t !== void 0)
      p[data_index] = t;
  })
}

export default GetLang;

export { InitLanguageSystem, currentLanguage, secondLanguage, GetLang, InitLanguageData, PageInitLanguage, HandleLanguageData };