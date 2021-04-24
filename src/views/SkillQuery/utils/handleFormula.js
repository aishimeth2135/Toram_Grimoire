import * as recast from "recast";

/**
 *  skillState: Object {
 *    slv: [Responsive] skill level,
 *    clv: [Responsive] character level
 *  }
 *  effectState: Object {
 *    stackStates[] {
 *      id: id from attrs,
 *      value: [Responsive] value of stack
 *    }
 *  }
 *  branch: SkillBranch
 */
export default function (str, { skillState, effectState, branch }) {
  if (!str) {
    console.log('input str is empty.');
    return '0';
  }
  const slv = skillState.slv,
    clv = skillState.clv;

  str = str.replace(/SLv/g, slv)
    .replace(/CLv/g, clv);

  const stack = [];

  if (branch && branch.attrs['stack_id']) {
    const ss = effectState.stackStates;
    const t = branch.attrs['stack_id'].split(/\s*,\s*/)
      .map(p => parseInt(p, 10))
      .map(p => {
        const t = ss.find(a => a.id == p);
        return t ? t.value : 0;
      });
    stack.push(...t);
    str = str.replace(/stack(?!\[)/g, 'stack[0]');
  } else {
    str = str.replace(/stack(\[\d+\])?/g, '0');
  }

  str = str = str.replace(/stack\[(\d+)\]/g, (m, m1) => stack[parseInt(m1, 10)]);

  const formulaExtra = branch ? branch.suffix.find(suf => suf.name === 'formula_extra') : null;
  if (formulaExtra)
    str = str.replace(/&(\d+):/g, (m, m1) => '__FORMULA_EXTRA_' + m1 + '__');

  function safeEval(str, dftv) {
    try {
      return eval(str);
    } catch (e) {
      console.warn('Unable to process: ' + str);
      return dftv === void 0 ? '??' : dftv;
    }
  }
  str = handle(str, safeEval);

  if (formulaExtra) {
    const texts = formulaExtra.attrs['texts'].split(/\s*,\s*/);
    str = str.replace(/__FORMULA_EXTRA_(\d+)__/g, (m, m1) => texts[parseInt(m1, 0)]);
  }

  return str;
}

function handle(str) {
  try {
    const ast = recast.parse(str);
    // console.log('-----------------');
    // console.log(str);
    // console.log(ast.program.body[0]);

    const builders = recast.types.builders;
    const TNT = recast.types.namedTypes;

    const back = (self, path) => path.parentPath.parentPath.parentPath ?
      self.traverse(path.parentPath.parentPath.parentPath) :
      self.traverse(path);


    const calc = (a, operator, b) => {
      let v = 0;
      if (operator === '+')
        v = a + b;
      else if (operator === '-')
        v = a - b;
      else if (operator === '*')
        v = a * b;
      else if (operator === '/')
        v = a / b;
      return v;
    }

    recast.visit(ast, {
      visitBinaryExpression(path) {
        const node = path.node;

        if (TNT.Literal.check(node.right)) {
          if (TNT.Literal.check(node.left) || (TNT.UnaryExpression.check(node.left) && node.left.operator == '-')) {
            const v = calc(!TNT.UnaryExpression.check(node.left) ? node.left.value : -1 * node.left.argument.value,
              node.operator, node.right.value);
            path.parentPath.get(path.name).replace(builders.literal(v));

            back(this, path);
            return;
          }
          if (TNT.BinaryExpression.check(node.left) && (node.operator == '*' || node.operator == '/') &&
            TNT.Literal.check(node.left.right) && node.left.operator == '*') {
            const v = calc(node.right.value, node.operator, node.left.right.value);
            path.get('right').replace(builders.literal(v));
            path.get('left').replace(node.left.left);

            back(this, path);
            return;
          }
        }

        this.traverse(path);
      },
      visitCallExpression(path) {
        const node = path.node;

        if (node.arguments.every(p => TNT.Literal.check(p))) {
          const args = node.arguments.map(p => p.value);

          const pros = [];
          let cur = node.callee;
          while (TNT.MemberExpression.check(cur.object)) {
            pros.push(cur.property.name);
            cur = cur.object;
          }
          pros.push(cur.property.name);
          cur = window[cur.object.name];
          pros.reverse().forEach(p => cur = cur[p]);

          const res = cur(...args);
          path.parentPath.get(path.name).replace(builders.literal(res));

          back(this, path);
          return;
        }
        this.traverse(path);
      },
      visitMemberExpression(path) {
        const node = path.node;

        if (node.computed && TNT.ArrayExpression.check(node.object)) {
          const ary = node.object.elements;
          if (ary.every(p => TNT.Literal.check(p)) && TNT.Literal.check(node.property)) {
            const v = ary[node.property.value].value;
            path.parentPath.get(path.name).replace(builders.literal(v));

            back(this, path);
            return;
          }
        }

        this.traverse(path);
      }
    });

    const res = recast.print(ast).code
      .replace(/\((\d+)\)/g, (m, m1) => m1);
    // console.log(res);
    return res;
  } catch (e) {
    console.error(e);
    console.log('str: ', str);
    return '0';
  }
}