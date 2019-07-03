
export default function LoadTagData(r, c){
    const
        TAG_NAME = 0,
        FRAME_NAME = 1,
        FRAME_VALUE = 2;
    let cur, curFrame;
    c.forEach((p, i) => {
        try {
            const name = p[TAG_NAME];
            if ( name !== '')
                cur = r.appendTag(name);
            const fn = p[FRAME_NAME], fv = p[FRAME_VALUE];
            if ( fn !== '' )
                curFrame = cur.appendFrame(fn, fv);
            else
                curFrame.appendValue(fv);
        }
        catch (e){
            console.warn('Error when load Tag-List.');
            console.log(e);
            console.log(p);
        }
    });
}