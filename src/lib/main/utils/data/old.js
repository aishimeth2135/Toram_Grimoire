// import * as recast from 'recast';
// /**
//  * @param {string} str
//  * @returns {string}
//  */
// function parseFormula(formulaStr, { methods = {} } = {}) {
//   const ast = recast.parse(formulaStr);
//   // console.log(ast.program.body[0]);

//   const builders = recast.types.builders;
//   const TNT = recast.types.namedTypes;

//   const back = (self, path) => {
//     path.parentPath.parentPath.parentPath ?
//       self.traverse(path.parentPath.parentPath.parentPath) :
//       self.traverse(path);
//   };

//   const calc = (a, operator, b) => {
//     if (operator === '+')
//       return a + b;
//     if (operator === '-')
//       return a - b;
//     if (operator === '*')
//       return a * b;
//     if (operator === '/')
//       return a / b;
//     if (operator === '&&')
//       return a && b;
//     if (operator === '||')
//       return a || b;
//     return 0;
//   }

//   recast.visit(ast, {
//     visitLogicalExpression(path) {
//       const node = path.node;
//       if (TNT.Literal.check(node.right) && TNT.Literal.check(node.left)) {
//         const value = calc(node.left.value, node.operator, node.right.value);
//         path.parentPath.get(path.name).replace(builders.literal(value));

//         back(this, path);
//         return;
//       }

//       this.traverse(path);
//     },
//     visitBinaryExpression(path) {
//       const node = path.node;
//       if (TNT.Literal.check(node.right)) {
//         if (TNT.Literal.check(node.left) || (TNT.UnaryExpression.check(node.left) && node.left.operator === '-')) {
//           const leftValue = !TNT.UnaryExpression.check(node.left) ? node.left.value : -1 * node.left.argument.value;
//           const value = calc(leftValue, node.operator, node.right.value);
//           path.parentPath.get(path.name).replace(builders.literal(value));

//           back(this, path);
//           return;
//         }
//         if (TNT.BinaryExpression.check(node.left) && (node.operator === '*' || node.operator === '/') &&
//           TNT.Literal.check(node.left.right) && node.left.operator === '*') {
//           const value = calc(node.right.value, node.operator, node.left.right.value);
//           path.get('right').replace(builders.literal(value));
//           path.get('left').replace(node.left.left);

//           back(this, path);
//           return;
//         }
//       }

//       this.traverse(path);
//     },
//     visitCallExpression(path) {
//       const node = path.node;

//       if (node.arguments.every(anode => TNT.Literal.check(anode) || TNT.UnaryExpression.check(anode))) {
//         const args = node.arguments.map(anode => {
//           if (TNT.UnaryExpression.check(anode)) {
//             return -1 * anode.argument.value;
//           }
//           return anode.value;
//         });

//         const pros = [];
//         let cur = node.callee;
//         if (TNT.Identifier.check(cur)) {
//           cur = methods[cur.name];
//         } else {
//           while (!TNT.Identifier.check(cur)) {
//             if (TNT.Identifier.check(cur.property)) {
//               pros.push(cur.property.name);
//             } else if (TNT.Literal.check(cur.property)) {
//               pros.push(cur.property.value);
//             } else {
//               return;
//             }
//             cur = cur.object;
//           }
//           if (cur.name in window) {
//             cur = window[cur.name];
//           } else {
//             cur = methods[cur.name];
//           }
//           pros.reverse().forEach(p => cur = cur[p]);
//         }

//         const value = cur(...args) || 0;
//         path.parentPath.get(path.name).replace(builders.literal(value));

//         back(this, path);
//         return;
//       }
//       this.traverse(path);
//     },
//     visitMemberExpression(path) {
//       const node = path.node;

//       if (node.computed && TNT.ArrayExpression.check(node.object)) {
//         const ary = node.object.elements;
//         if (ary.every(p => TNT.Literal.check(p)) && TNT.Literal.check(node.property)) {
//           const value = ary[node.property.value].value;
//           path.parentPath.get(path.name).replace(builders.literal(value));

//           back(this, path);
//           return;
//         }
//       }

//       this.traverse(path);
//     },
//   });

//   return recast.print(ast).code.replace(/\((\d+(?:\.\d+)?)\)/g, (m, m1) => m1);
// }
