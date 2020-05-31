export default function(str, { skillState, effectState }) {
  if (!str)
    return '0';
  const slv = skillState.slv,
    clv = skillState.clv,
    stack = effectState.stackStates.map(p => p.value);

  str = str.replace(/SLv/g, slv)
    .replace(/CLv/g, clv)
    .replace(/stack(?!\[)/g, 'stack[0]');

  function safeEval(str, dftv) {
    try {
      return eval(str);
    } catch (e) {
      console.warn('Unable to process: ' + str);
      return dftv === void 0 ? '??' : dftv;
    }
  }
  return handle(str, safeEval);
}

function handle(str, eval_fun) {
  str = str.replace(/\s+/g, '');
  // console.log(str);

  const isOperator = c => /^[\+\-\*/\(\),]$/.test(c);

  const isVarName = v => /^[a-zA-Z_$][$a-zA-Z0-9\._]*$/.test(v);

  const notText = n => /^\-?[\d\.]+$/.test(n);

  const calc_fun = (n1, o, n2, resAry) => {
    if (notText(n1) && notText(n2)) {
      return eval_fun(n1 + o + n2);
    }
    if (o == '*' || o == '/') {
      return n1 + o + n2;
    }
    resAry.push(n1, o);
    return n2;
  };

  // 用來取得push時的權重
  function w(c) {
    switch (c) {
      case '+':
      case '-':
        return 5;
      case '*':
      case '/':
        //case '%':
        return 6;
      case '(':
      case ')':
        return 8;
    }
  }

  let postFix, stk;
  const envirs = [];

  function createEnvir() {
    const t = {
      postFix: [],
      stk: []
    };
    envirs.push(t);
    postFix = t.postFix;
    stk = t.stk;
    return t;
  }

  function beforeLeaveEnvir() {
    if (num !== '') {
      postFix.push(num);
      num = '';
    }
    while (stk.length != 0)
      postFix.push(stk.pop());
  }

  const obj_stk = [];
  const obj_stk_top = () => obj_stk[obj_stk.length - 1];

  function addParam() {
    beforeLeaveEnvir();
    obj_stk_top().params ? obj_stk_top().params.push(envirs.pop()) : envirs.pop();
    const t = envirs[envirs.length - 1];
    postFix = t.postFix;
    stk = t.stk;
  }

  createEnvir();
  let num = '';

  try {
    str.split('').forEach((c, i, ary) => {
      if (c == '[') {
        if (i == 0 || isOperator(ary[i - 1])) {
          obj_stk.push({
            type: 'array',
            name: '',
            params: []
          });

          postFix.push(obj_stk_top());
          createEnvir();
          return;
        }
        if (num !== '') {
          obj_stk.push({
            type: 'array',
            name: num,
            params: null
          });
          postFix.push(obj_stk_top());
          createEnvir();
          num = '';

          addParam();
          obj_stk.pop();
        }

        obj_stk.push({
          type: 'array-index',
          params: []
        });
        postFix.push(obj_stk_top());
        createEnvir();

        return;
      }
      if (c == ']') {
        if (obj_stk_top().type != 'array' && obj_stk_top().type != 'array-index')
          throw new Error('error: invalid formula | array, array-index | end');

        addParam();
        obj_stk.pop();

        return;
      }

      if (!isOperator(c) || (c == '-' && (i == 0 || isOperator(ary[i - 1])))) {
        num += c;
        return;
      }

      if (num !== '') {
        if (c == '(' && isVarName(num)) {
          obj_stk.push({
            type: 'function',
            name: num,
            params: []
          });

          postFix.push(obj_stk_top());
          createEnvir();
          num = '';
          return;
        } else
          postFix.push(num);
        num = '';
      }

      if (c == ',') {
        addParam();
        createEnvir();
        return;
      }

      // c為當前的運算子。開始對c作條件判斷。
      if (c == ')') {
        // 如果是")"，一直pop stk並放到postFix裡直到遇到"("
        if (stk.indexOf('(') == -1 && obj_stk.length != 0) {
          if (obj_stk_top().type != 'function')
            throw new Error('error: invalid formula | function');
          addParam();
          obj_stk.pop();
        } else {
          let t;
          while ((t = stk.pop()) != '(') {
            if (stk.length == 0) // 左刮號找不到和它成對的右刮號時。
              throw new Error('Unrecognizable operator: )');
            postFix.push(t);
          }
        }
        return;
      }

      // 設c的權重為wi。stk.top()的權重為wt。
      // 不停pop stk並放到postFix裡，直到(wi > wt)。
      // 要注意'('在stk內部的話，權重為最小。
      while (w(c) <= w(stk[stk.length - 1]) && stk[stk.length - 1] != '(')
        postFix.push(stk.pop());
      stk.push(c);
    });

    beforeLeaveEnvir();

    // console.log('envirs: ', envirs.slice());
    // console.log('obj_stk: ', obj_stk.slice());

    const isNumStr = v => /^\-?[0-9.]+$/.test(v);

    // console.log('[o] postfix :', envirs[0].postFix.slice());

    function handlePostFix(env) {
      const _stk = [];
      const _postFix = env.postFix.reverse();
      const resAry = [];

      while (_postFix.length != 0) {
        let p = _postFix.pop();

        if (typeof p == 'object') {
          if (p.type == 'function') {
            const params = p.params.map(a => handlePostFix(a));
            const fun_str = p.name + '(' + params.join(', ') + ')';
            p = params.every(a => isNumStr(a)) ?
              eval_fun(fun_str) :
              fun_str;
          } else if (p.type == 'array') {
            const pre_ary = p;
            const ary_idx = _postFix.pop();

            const idx = handlePostFix(ary_idx.params[0]);

            if (pre_ary.params != null) {
              const ary_params = pre_ary.params.map(a => handlePostFix(a));
              const fun_str = `[${ary_params.join(', ')}][${idx}]`;
              p = ary_params.every(a => isNumStr(a)) && isNumStr(idx) ?
                eval_fun(fun_str) :
                fun_str;
            } else {
              const fun_str = `${pre_ary.name}[${idx}]`;
              p = isNumStr(idx) ?
                eval_fun(fun_str) :
                fun_str;
            }
          } else {
            console.log(p);
            console.log(_postFix.slice());
            p = '??';
          }
        }
        if (isOperator(p)) {
          const a = _stk.pop(),
            b = _stk.pop();
          if (a == void 0 || b == void 0)
            throw new Error('Invaild formula: ' + str);
          p = calc_fun(b, p, a, resAry);
        }
        _stk.push(p.toString());
      }
      return [...resAry, _stk.pop()].join('').replace(/\+\-/g, '-');
    }

    return handlePostFix(envirs[0]);
  } catch (e) {
    console.error(e);
    console.log("postFix: ", postFix);
    console.log("stk: ", stk);
    console.log("obj_stk: ", obj_stk);
    console.log("envirs: ", envirs);
    return '0';
  }
}