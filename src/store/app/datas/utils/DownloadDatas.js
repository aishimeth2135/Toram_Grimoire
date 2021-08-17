import { DataPath, createLoadDataPromise, loadLangDatas } from '@services/DataPath.js';

export default async function(...paths) {
  const datas = paths.map(() => []);
  const promises = [];
  paths.forEach((p, idx) => {
    if (typeof p === 'string')
      p = { path: p };
    const { path, lang=false } = p;
    const url = DataPath(path);
    lang ?
      (datas[idx] = loadLangDatas(path, promises)) :
      promises.push(createLoadDataPromise(url, datas[idx], 0));
  });
  await Promise.all(promises);

  return datas;
}
