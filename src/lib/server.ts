import { jsx } from 'astro/jsx-runtime';
import { renderJSX } from 'astro/runtime/server/jsx.js';
import { AstroError } from 'astro/errors';
import type { NamedSSRLoadedRendererValue } from 'astro';

function slotName(str: string) {
  return str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
}

async function check(Component: any) {
  // Check if this is an org component
  return Component && Component[Symbol.for('org-component')];
}

async function renderToStaticMarkup(
  this: any,
  Component: any,
  props = {},
  { default: children = null, ...slotted } = {},
) {
  const slots: Record<string, any> = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }

  const { result } = this;
  try {
    const html = await renderJSX(result, jsx(Component, { ...props, ...slots, children }));
    return { html };
  } catch (e) {
    throwEnhancedErrorIfOrgComponent(e as Error, Component);
    throw e;
  }
}

function throwEnhancedErrorIfOrgComponent(error: Error, Component: any) {
  // if the exception is from an org component
  // throw an error
  if (Component[Symbol.for('org-component')]) {
    // if it's an existing AstroError, we don't need to re-throw, keep the original hint
    if (AstroError.is(error)) return;
    // Provide better title and hint for the error overlay
    (error as any).title = error.name;
    (error as any).hint =
      `This issue often occurs when your Org component encounters runtime errors.`;
    throw error;
  }
}

const renderer: NamedSSRLoadedRendererValue = {
  name: 'astro:jsx',
  check,
  renderToStaticMarkup,
};

export default renderer; 