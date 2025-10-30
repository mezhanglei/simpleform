import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "./decorator";

export default async function createEvaluator(ctx?, options?) {
  if (ctx) {
    const arena = new Arena(ctx, options || { isMarshalable: true });
    return arena;
  } else {
    const quickjs = await getQuickJS();
    const ctx = quickjs.newContext();
    const arena = new Arena(ctx, options || { isMarshalable: true });
    return arena;
  }
}
