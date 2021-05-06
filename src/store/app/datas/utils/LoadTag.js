import { HandleLanguageData } from "@services/Language";

export default function LoadTagData(r, datas) {
  const
    // TAG_NAME = 0,
    FRAME_NAME = 1,
    // FRAME_VALUE = 2,
    INDEX = {
      TAG_NAME: 0,
      FRAME_NAME: 1,
      FRAME_VALUE: 2
    },
    LANG_DATA = {
      TAG_NAME: 0,
      FRAME_VALUE: 1
    };

  HandleLanguageData(datas, {
    [INDEX.TAG_NAME]: LANG_DATA.TAG_NAME,
    [INDEX.FRAME_VALUE]: LANG_DATA.FRAME_VALUE
  })
  const c = datas[0];
  let cur, curFrame;
  c.forEach((p, i) => {
    if (i == 0)
      return;
    try {
      let name = p[INDEX.TAG_NAME];
      if (name !== '')
        cur = r.appendTag(name);
      const fn = p[FRAME_NAME],
        fv = p[INDEX.FRAME_VALUE];
      if (fn !== '')
        curFrame = cur.appendFrame(fn, fv);
      else
        curFrame.appendValue(fv);
    } catch (e) {
      console.warn('Error when load Tag-List.');
      console.log(e);
      console.log(p);
    }
  });
}