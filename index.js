var Walker = require('node-source-walk');

/**
 * Extracts the dependencies of the supplied es6 module
 *
 * @param  {String|Object} src - File's content or AST
 * @return {String[]}
 */
module.exports = function(src, options) {
  var walker = new Walker();

  var dependencies = [];

  if (typeof src === 'undefined') { throw new Error('src not given'); }

  if (src === '') {
    return dependencies;
  }

  var importSpecifiers = {};
  walker.walk(src, function(node) {
    switch (node.type) {
      case 'ImportDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
          node.specifiers.forEach((specifier) => {
            var specifierValue = {
              isDefault: specifier.type === 'ImportDefaultSpecifier',
              name: specifier.local.name
            };
            importSpecifiers[node.source.value]
              ? importSpecifiers[node.source.value].push(specifierValue)
              : importSpecifiers[node.source.value] = [specifierValue];
          });
        }
        break;
      case 'ExportNamedDeclaration':
      case 'ExportAllDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
        }
        break;
      case 'CallExpression':
        if (node.callee.type === 'Import' && node.arguments.length) {
          dependencies.push(node.arguments[0].value);
        }
      default:
        return;
    }
  });

  options.importSpecifiers = importSpecifiers;
  return dependencies;
};
