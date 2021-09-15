import { HandleLanguageData } from '@/shared/services/Language';

import TagSystem from '@/lib/Tag';
import { Tag, TagFrame } from '@/lib/Tag/Tag';

import { LangCsvData } from './DownloadDatas';

export default function LoadTagData(root: TagSystem, datas: LangCsvData) {
  const
    // TAG_NAME = 0,
    FRAME_NAME = 1,
    // FRAME_VALUE = 2,
    INDEX = {
      TAG_NAME: 0,
      FRAME_NAME: 1,
      FRAME_VALUE: 2,
    },
    LANG_DATA = {
      TAG_NAME: 0,
      FRAME_VALUE: 1,
    };

  HandleLanguageData(datas, {
    [INDEX.TAG_NAME]: LANG_DATA.TAG_NAME,
    [INDEX.FRAME_VALUE]: LANG_DATA.FRAME_VALUE,
  });
  const c = datas[0];
  let curTag: Tag;
  let curFrame: TagFrame;
  c.forEach((row, idx) => {
    if (idx === 0)
      return;
    try {
      const name = row[INDEX.TAG_NAME];
      if (name !== '')
        curTag = root.appendTag(name);
      const fn = row[FRAME_NAME],
        fv = row[INDEX.FRAME_VALUE];
      if (fn !== '')
        curFrame = curTag.appendFrame(fn, fv);
      else
        curFrame.appendValue(fv);
    } catch (e) {
      console.warn('[Load Tag] unknown error');
      console.log(e);
      console.log(row);
    }
  });
}
