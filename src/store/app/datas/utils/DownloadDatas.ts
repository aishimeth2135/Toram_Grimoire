import Papa from 'papaparse';
import store from '@/store';
import { DataPath, DataPathLang } from '@/shared/services/DataPath';

type PathItem = string | { path: string; lang?: boolean };
type CsvData = Array<Array<string>>;
type LangData = [CsvData, CsvData | null, CsvData | null];

export default async function(...paths: Array<PathItem>): Promise<Array<LangData>> {
  const promises = paths.map(async (pathItem) => {
    if (typeof pathItem === 'string') {
      pathItem = { path: pathItem };
    }
    const { path: pathId, lang = false } = pathItem;
    const results: LangData = lang ?
      await loadLangDatas(pathId) :
      [await createLoadPromise(DataPath(pathId)), null, null];
    return results;
  });
  const result = await Promise.all(promises);

  return result;
}

async function createLoadPromise(path: string): Promise<CsvData> {
  if (path) {
    try {
      const f = await fetch(path);
      const csvstr = await f.text();

      return Papa.parse(csvstr).data as CsvData;

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

      return Papa.parse(csvstr).data as CsvData;
    } catch (e) {
      console.warn('[Error] load backup data: ' + orignalPath);
      console.log(e);
    }
  }
  return [[]];
}

const DEFAULT_LANG = 1;
async function loadLangDatas(pathId: string): Promise<LangData> {
  const promises: Array<Promise<CsvData>> = [];
  const current = store.getters['language/primaryLang'] as number,
    second = store.getters['language/secondaryLang'] as number;
  const datas: Array<CsvData | null> = Array(3);

  promises.push(createLoadPromise(DataPath(pathId)));
  if (current !== DEFAULT_LANG) {
    const path = DataPathLang(pathId);
    if (path[current] !== null) {
      promises.push(createLoadPromise(path[current] as string));
    }
    if (current !== second && path[second] !== null) {
      promises.push(createLoadPromise(path[second] as string));
    }
  }

  const results = await Promise.allSettled(promises);
  results.map((item, idx) => {
    datas[idx] = item.status === 'fulfilled' ? item.value : null;
  });
  return datas as LangData;
}

export type { CsvData };
