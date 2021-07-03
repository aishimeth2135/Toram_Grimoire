export function separateText(target, pattern) {
  const t = target.replace(pattern, (m, m1) => `####<--->${m1}####`);
  return t.split('####').map((p, i) => {
    let text = p, separate = false;
    if (p.slice(0, 5) === '<--->') {
      text = text.slice(5);
      separate = true;
    }
    return {
      iid: i,
      text,
      separate
    };
  });
}

import * as recast from "recast";
/**
 * @param {string} str
 * @returns {string}
 */
export function parseFormula(str) {
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
      if (operator === '+')
        return a + b;
      if (operator === '-')
        return a - b;
      if (operator === '*')
        return a * b;
      if (operator === '/')
        return a / b;
      return 0;
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
          if (TNT.BinaryExpression.check(node.left) && (node.operator === '*' || node.operator === '/') &&
            TNT.Literal.check(node.left.right) && node.left.operator === '*') {
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
      .replace(/\((\d+(?:\.\d+)?)\)/g, (m, m1) => m1);
    // console.log(res);
    return res;
  } catch (e) {
    console.error(e);
    console.log('unable to parse formula: ', str);
    return '0';
  }
}