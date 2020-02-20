import stylelint from 'stylelint';
import { Root, Result } from 'postcss';

const ruleName = 'plugin/foo-bar';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: 'Expected ...',
});

function rule(): (root: Root, result: Result) => Promise<void> {
  return async (root, result): Promise<void> => {
    root.walkRules(
      async (rule): Promise<void> => {
        if (!rule.selectors) {
          return;
        }

        const resolvedSelectors = flatMap(
          rule.selectors,
          (selectors): string[] => resolveNestedSelector(selectors, rule),
        );

        async function processSelector(selector: string): Promise<void> {
          const selectorAst = await selectorProcessor.ast(selector);
          const filteredAst = removeUnassertiveSelector(selectorAst);
          const matched = await unwrapUndefinable(plugin).match(
            filteredAst,
            pluginOptions,
          );

          if (!matched) {
            stylelint.utils.report({
              result,
              ruleName,
              node: rule,
              message: messages.rejected(selector, path.basename(documentPath)),
            });
          }
        }

        await Promise.all(resolvedSelectors.map(processSelector));
      },
    );
  };
}

export default stylelint.createPlugin(ruleName, rule);
