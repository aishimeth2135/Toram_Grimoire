function empty(obj){
    if ( obj === null || typeof obj !== 'object' )
        return;
    Object.keys(obj).forEach(key => delete obj[key]);
}
function isEmpty(obj){
    if ( typeof obj !== 'object' )
        return true;
    return Object.keys(obj).length == 0;
}

export default {empty, isEmpty};