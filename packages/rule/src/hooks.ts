import { useCallback, useEffect, useMemo, useState } from "react";
import { RuleBuilder } from "./store";

export function useRuleBuilder() {
  return useMemo(() => new RuleBuilder(), []);
}

// 返回
export function useRuleBuilderTree(builder: RuleBuilder, callback?: Function) {
  const [data, setData] = useState<RuleBuilder["tree"]>();

  const ruleTreeWatcher = useCallback(
    (newValue, oldValue) => {
      setData(newValue);
      callback?.(newValue, oldValue);
    },
    [callback]
  );

  useEffect(() => {
    if (!builder) return;
    const uninstall = builder.subscribeTree(ruleTreeWatcher);
    return () => {
      uninstall?.();
    };
  }, [ruleTreeWatcher]);

  return [data, setData] as const;
}
