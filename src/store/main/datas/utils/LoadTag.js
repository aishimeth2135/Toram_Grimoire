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
  const [c, lang_c, slang_c] = datas;
  const loadData = (index, set_name) => {
    const d1 = c[index][INDEX[set_name]],
      d2 = lang_c && lang_c[index] ? lang_c[index][LANG_DATA[set_name]] : null,
      d3 = slang_c && slang_c[index] ? slang_c[index][LANG_DATA[set_name]] : null;
    return [d2, d3, d1].find(t => t !== '' && t !== null && t !== void 0) || '';
  };
  let cur, curFrame;
  c.forEach((p, i) => {
    if (i == 0)
      return;
    try {
      const name = loadData(i, 'TAG_NAME');
      if (name !== '')
        cur = r.appendTag(name);
      const fn = p[FRAME_NAME],
        fv = loadData(i, 'FRAME_VALUE');
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