import jsep from 'jsep';

console.log(JSON.stringify(jsep('test.a.b.c'), null, 2));

console.log(JSON.stringify(jsep('test["a" + "b"].b.c'), null, 2));