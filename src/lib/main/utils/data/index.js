import * as recast from "recast";

/**
 * @param {string} str
 * @returns {string}
 */
function parseFormula(formulaStr) {
  try {
    const ast = recast.parse(formulaStr);
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
      },
    });

    const res = recast.print(ast).code
      .replace(/\((\d+(?:\.\d+)?)\)/g, (m, m1) => m1);
    return res;
  } catch (e) {
    console.error(e);
    console.log('[parse formula] Unable to parse formula: ', formulaStr);
    return '0';
  }
}

/**
 * @typedef HandleFormulaOptions
 * @type {Object}
 * @property {object} texts - mapping of text
 * @property {object} vars - mapping of vars
 */
/**
 * @param {string} formulaStr
 * @param {HandleFormulaOptions} options
 */
function handleFormula(formulaStr, { vars = {}, texts = {} }) {
  const varsMap = new Map();
  const handleVarsMapping = (prefix, target) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`;
      if (typeof value === 'object') {
        handleVarsMapping(mapKey, value);
      } else {
        varsMap.set(mapKey, value);
      }
    });
  };
  handleVarsMapping('', vars);
  for (const [key, value] of varsMap) {
    let realValue = value;
    if (typeof realValue === 'function') {
      realValue = value(key);
    }
    formulaStr = formulaStr.replace(new RegExp(key, 'g'), realValue);
  }

  const textKeys = Object.keys(texts);
  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(new RegExp(key, 'g'), `__HANDLE_FORNULA_TEXT_${idx}__`);
  });

  formulaStr = parseFormula(formulaStr);

  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(new RegExp(`__HANDLE_FORNULA_TEXT_${idx}__`, 'g'), texts[key]);
  });

  return formulaStr;
}

export { parseFormula, handleFormula };
