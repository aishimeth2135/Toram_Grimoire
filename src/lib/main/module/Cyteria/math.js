const status = {
    checkBoundary: false
};
function removeNumberDigit(v){
    const t = v.toString();
    if ( t.indexOf('e') == -1 )
        return parseInt(t.replace('.', ''), 10);
    const l = digitLength(v);
    return l > 0 ? parseInt(t.split('e')[0]) : v;
}
function digitLength(v){
    const t = v.toString();
    if ( t.indexOf('e') == -1 )
        return (t.split('.')[1] || '').length;
    const m = t.split('e')[1];
    return n.charAt(0) == '-' ? parseInt(m.slice(1)) : 0;
}
function checkBoundary(v){
    if ( status.checkBoundary )
        if ( v > Number.MAX_SAFE_INTEGER || v < new Number.MIN_SAFE_INTEGER )
            console.warn('Integer is out of boundary when calculate, the result may not be accurate.');
}
function filterNumberArray(ary){
    ary = ary
        .map(p => typeof p == 'string' ? parseFloat(p) : p)
        .filter(p => typeof p == 'number' && !Number.isNaN(p) && Number.isFinite(p));
    ary.forEach(p => checkBoundary(p));
}

function add(...nums){
    filterNumberArray(nums);
    const base = Math.pow(10, Math.max(...nums.map(p => digitLength(p))));
    let res = 0;
    nums.forEach(p => {
        res += mul(p, base);
        checkBoundary(res);
    });
    return res / base;
}
function sub(...nums){
    filterNumberArray(nums);
    const base = Math.pow(10, Math.max(...nums.map(p => digitLength(p))));
    let res = mul(nums[0], base);
    nums.slice(1).forEach(p => {
        res -= mul(p, base);
        checkBoundary(res);
    });
    return res / base;
}
function mul(...nums){
    filterNumberArray(nums);
    let res = 1, dn = 0;
    nums.forEach(p => {
        dn += digitLength(p);
        p = removeNumberDigit(p);
        res *= p;
        checkBoundary(res);
    });
    return res / Math.pow(10, dn);
}
function div(...nums){
    filterNumberArray(nums);
    let res = nums[0], dn = 0;
    nums.slice(1).forEach(p => {
        dn += digitLength(p) - digitLength(res);
        p = removeNumberDigit(p);
        res = removeNumberDigit(res);
        checkBoundary(res);
        res /= p;
    });
    return res / Math.pow(10, dn);
}
function setStatus(n, v){
    if ( status[n] !== void 0 )
        status[n] = v;
    else
        console.warn(`[status: ${n}] not found.`)
}

export default {add, sub, mul, div, setStatus};