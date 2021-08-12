import Papa from "papaparse";
import store from "@/store";

function DataPath(id) {
  /**
   * order of language: [en, zh_tw, ja, zh_cn]
   */
  switch (id) {
  case 'Skill':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=A:Q';
  case 'Skill/language':
    return [
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=R:R',
      null,
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=S:S',
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=T:T',
    ];
  case 'Skill Main':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=A:D';
  case 'Skill Main/language':
    return [
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=F:F',
      null,
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=G:G',
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=H:H',
    ];
  case 'Stats':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv&range=A:F';
  case 'Stats/language':
    return [
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1353062937&single=true&output=csv&range=B:C',
      null,
      null,
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1353062937&single=true&output=csv&range=F:G',
    ];
  case 'Character Stats':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHrEp60Q4BFKM2yI09FyJWZFKnxif0oZfTkWiXXL-7am6BWoAtN___hxKtFDkbofflHQgrON74qOdk/pub?gid=0&single=true&output=csv&range=A:I';
  case 'Character Stats/language':
    return [
      null,
      null,
      null,
      null,
    ];
  case 'Tag':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=A:C';
  case 'Tag/language':
    return [
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=D:E',
      null,
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=F:G',
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=H:I',
    ];
  case 'Equipment':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=0&single=true&output=csv&range=A:I';
  case 'Crystal':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=1665548440&single=true&output=csv&range=A:E';
  case 'Enchant':
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4beI9I-sFoTgbTaKeMHRVo3xNm3gc5nQ-MWb9u7dlzRk0QmnMoJwcaR0815IqP0t-9-htpS8mUdQ1/pub?gid=0&single=true&output=csv&range=A:M';
  }
  console.warn('Unknow DataPath Name: ' + id);
  return;
}

async function createLoadDataPromise(path, data_ary, index=0) {
  if (typeof path === 'string' && path) {
    try {
      const f = await fetch(path);
      const csvstr = await f.text();

      const data = Papa.parse(csvstr).data;
      data_ary[index] = data;

      return;
    } catch (e) {
      console.warn(`[Error] load data: ${path}. Try to use backup...`);
      console.log(e);
    }

    const orignalPath = path;
    try {
      path = encodeURIComponent(path);
      path = 'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' + path;

      const f = await fetch(path);
      const csvstr = await f.text();

      const data = Papa.parse(csvstr).data;
      data_ary[index] = data;
    } catch (e) {
      console.warn('[Error] load backup data: ' + orignalPath);
      console.log(e);

      throw e;
    }
  }
  else {
    data_ary[index] = null;
  }
  // return new Promise((resolve, reject) => {
  //   if (typeof path == 'string' && path) {
  //     Papa.parse(path, {
  //       download: true,
  //       complete(res) {
  //         data_ary[index] = res.data;
  //         resolve();
  //       },
  //       error(err) {
  //         data_ary[index] = null;
  //         console.log(err);
  //         console.warn('[Error] load data: ' + path);
  //         console.warn('Try to use backup...');
  //         // reject();
  //         const orignalPath = path;
  //         path = encodeURIComponent(path);
  //         path = 'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' + path;

  //         Papa.parse(path, {
  //           download: true,
  //           complete(res) {
  //             data_ary[index] = res.data;
  //             succ = true;
  //             resolve();
  //           },
  //           error(err) {
  //             data_ary[index] = null;
  //             console.warn('[Error] load backup data: ' + orignalPath);
  //             console.log(err);
  //             reject();
  //           }
  //         });
  //       }
  //     });
  //   else {
  //     data_ary[index] = null;
  //     resolve();
  //   }
  // });
}

function loadLangDatas(pathId, promises, defaultLang=1) {
  const current = store.getters['language/primaryLang'],
    second = store.getters['language/secondaryLang'];
  const datas = Array(3);

  promises.push(createLoadDataPromise(DataPath(pathId), datas, 0));
  if (current !== defaultLang) {
    const path = DataPath(pathId + '/language');
    promises.push(createLoadDataPromise(path[current], datas, 1));
    if (current !== second)
      promises.push(createLoadDataPromise(path[second], datas, 2));
  }

  return datas;
}

export { DataPath, createLoadDataPromise, loadLangDatas };
