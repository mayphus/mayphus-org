// @ts-nocheck
import { describe, test, expect, vi, beforeEach } from 'vitest';
import serverRenderer from './server.js';

// Mock Astro's JSX runtime and server rendering
vi.mock('astro/jsx-runtime', () => ({
  jsx: vi.fn((component, props) => ({ component, props })),
}));

vi.mock('astro/runtime/server/jsx.js', () => ({
  renderJSX: vi.fn(),
}));

vi.mock('astro/errors', () => ({
  AstroError: {
    is: vi.fn(),
  },
}));

import { jsx } from 'astro/jsx-runtime';
import { renderJSX } from 'astro/runtime/server/jsx.js';
import { AstroError } from 'astro/errors';

const mockJsx = vi.mocked(jsx);
const mockRenderJSX = vi.mocked(renderJSX);
const mockAstroError = vi.mocked(AstroError);

describe('server renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderer exports', () => {
    test('exports correct renderer structure', () => {
      expect(serverRenderer).toHaveProperty('name', 'astro:jsx');
      expect(serverRenderer).toHaveProperty('check');
      expect(serverRenderer).toHaveProperty('renderToStaticMarkup');
      expect(typeof serverRenderer.check).toBe('function');
      expect(typeof serverRenderer.renderToStaticMarkup).toBe('function');
    });
  });

  describe('check function', () => {
    test('returns true for org components', async () => {
      const orgComponent = {
        [Symbol.for('org-component')]: true,
      };

      const result = await serverRenderer.check(orgComponent);
      expect(result).toBe(true);
    });

    test('returns falsy for non-org components', async () => {
      const regularComponent = {};
      const result = await serverRenderer.check(regularComponent);
      expect(result).toBeFalsy();
    });

    test('returns falsy for null/undefined components', async () => {
      expect(await serverRenderer.check(null)).toBeFalsy();
      expect(await serverRenderer.check(undefined)).toBeFalsy();
    });

    test('handles components with falsy org-component symbol', async () => {
      const componentWithFalsySymbol = {
        [Symbol.for('org-component')]: false,
      };

      const result = await serverRenderer.check(componentWithFalsySymbol);
      expect(result).toBe(false);
    });

    test('handles components with other symbols', async () => {
      const componentWithOtherSymbol = {
        [Symbol.for('other-component')]: true,
      };

      const result = await serverRenderer.check(componentWithOtherSymbol);
      expect(result).toBeFalsy();
    });
  });

  describe('renderToStaticMarkup function', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        result: { /* mock Astro result object */ },
      };
      mockRenderJSX.mockResolvedValue('<div>rendered content</div>');
    });

    test('renders component with basic props', async () => {
      const Component = vi.fn();
      const props = { title: 'Test Title', id: 'test-id' };
      
      const result = await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children: null,
      });
      
      expect(mockRenderJSX).toHaveBeenCalledWith(
        mockContext.result,
        { component: Component, props: { ...props, children: null } }
      );
      
      expect(result).toEqual({ html: '<div>rendered content</div>' });
    });

    test('handles children correctly', async () => {
      const Component = vi.fn();
      const props = { title: 'Test' };
      const children = 'Child content';
      const slots = { default: children };

      const result = await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props,
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children,
      });
      
      expect(result).toEqual({ html: '<div>rendered content</div>' });
    });

    test('processes slotted content with name transformation', async () => {
      const Component = vi.fn();
      const props = { title: 'Test' };
      const slots = {
        default: 'Main content',
        'slot-name': 'Slot content',
        'another_slot': 'Another slot',
        'camelCase': 'Camel case slot',
      };

      await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props,
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children: 'Main content',
        slotName: 'Slot content',
        anotherSlot: 'Another slot',
        camelCase: 'Camel case slot',
      });
    });

    test('handles empty slots object', async () => {
      const Component = vi.fn();
      const props = { title: 'Test' };

      await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props,
        {}
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children: null,
      });
    });

    test('handles undefined slots', async () => {
      const Component = vi.fn();
      const props = { title: 'Test' };

      await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children: null,
      });
    });

    test('merges props and processed slots correctly', async () => {
      const Component = vi.fn();
      const props = { 
        title: 'Test',
        className: 'test-class',
      };
      const slots = {
        default: 'Main content',
        'header-slot': 'Header content',
        footer: 'Footer content',
      };

      await serverRenderer.renderToStaticMarkup.call(
        mockContext,
        Component,
        props,
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        title: 'Test',
        className: 'test-class',
        children: 'Main content',
        headerSlot: 'Header content',
        footer: 'Footer content',
      });
    });
  });

  describe('error handling', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        result: {},
      };
    });

    test('re-throws non-org component errors without modification', async () => {
      const Component = vi.fn();
      const error = new Error('Regular component error');
      
      mockRenderJSX.mockRejectedValue(error);

      await expect(
        serverRenderer.renderToStaticMarkup.call(mockContext, Component, {})
      ).rejects.toThrow('Regular component error');
    });

    test('enhances errors from org components', async () => {
      const OrgComponent = {
        [Symbol.for('org-component')]: true,
      };
      const error = new Error('Org component error');
      
      mockRenderJSX.mockRejectedValue(error);
      mockAstroError.is.mockReturnValue(false);

      await expect(
        serverRenderer.renderToStaticMarkup.call(mockContext, OrgComponent, {})
      ).rejects.toThrow();

      // Verify error was enhanced
      expect(error).toHaveProperty('title', 'Error');
      expect(error).toHaveProperty('hint');
      expect((error as any).hint).toContain('Org component encounters runtime errors');
    });

    test('does not enhance existing AstroErrors from org components', async () => {
      const OrgComponent = {
        [Symbol.for('org-component')]: true,
      };
      const astroError = new Error('Astro error');
      (astroError as any).title = 'Original Title';
      (astroError as any).hint = 'Original Hint';
      
      mockRenderJSX.mockRejectedValue(astroError);
      mockAstroError.is.mockReturnValue(true); // Simulate AstroError.is() returning true

      await expect(
        serverRenderer.renderToStaticMarkup.call(mockContext, OrgComponent, {})
      ).rejects.toThrow('Astro error');

      // Should not modify existing AstroError
      expect((astroError as any).title).toBe('Original Title');
      expect((astroError as any).hint).toBe('Original Hint');
    });

    test('handles renderJSX errors gracefully', async () => {
      const Component = {
        [Symbol.for('org-component')]: true,
      };
      
      mockRenderJSX.mockRejectedValue(new Error('JSX rendering failed'));
      mockAstroError.is.mockReturnValue(false);

      await expect(
        serverRenderer.renderToStaticMarkup.call(mockContext, Component, {})
      ).rejects.toThrow();
    });
  });

  describe('slot name transformation', () => {
    // Test the slotName function indirectly through renderToStaticMarkup
    test('transforms kebab-case to camelCase', async () => {
      const Component = vi.fn();
      const slots = {
        'header-content': 'Header',
        'footer-nav': 'Footer',
        'side-bar': 'Sidebar',
      };

      mockRenderJSX.mockResolvedValue('<div>test</div>');

      await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        {},
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        children: null,
        headerContent: 'Header',
        footerNav: 'Footer',
        sideBar: 'Sidebar',
      });
    });

    test('transforms snake_case to camelCase', async () => {
      const Component = vi.fn();
      const slots = {
        'header_content': 'Header',
        'main_section': 'Main',
        'nav_bar': 'Nav',
      };

      mockRenderJSX.mockResolvedValue('<div>test</div>');

      await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        {},
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        children: null,
        headerContent: 'Header',
        mainSection: 'Main',
        navBar: 'Nav',
      });
    });

    test('handles mixed case transformations', async () => {
      const Component = vi.fn();
      const slots = {
        'multi-word-slot': 'Multi word',
        'single': 'Single',
        'already-camelCase': 'Already camel',
        'with_underscores_and-dashes': 'Mixed',
      };

      mockRenderJSX.mockResolvedValue('<div>test</div>');

      await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        {},
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        children: null,
        multiWordSlot: 'Multi word',
        single: 'Single',
        alreadyCamelCase: 'Already camel',
        withUnderscoresAndDashes: 'Mixed',
      });
    });

    test('trims whitespace from slot names', async () => {
      const Component = vi.fn();
      const slots = {
        '  spaced-slot  ': 'Spaced content',
        '\t\nindented-slot\n\t': 'Indented content',
      };

      mockRenderJSX.mockResolvedValue('<div>test</div>');

      await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        {},
        slots
      );

      expect(mockJsx).toHaveBeenCalledWith(Component, {
        children: null,
        spacedSlot: 'Spaced content',
        indentedSlot: 'Indented content',
      });
    });
  });

  describe('integration scenarios', () => {
    test('works with complex component props and slots', async () => {
      const Component = {
        [Symbol.for('org-component')]: true,
      };
      
      const props = {
        title: 'Complex Component',
        data: { nested: { value: 42 } },
        array: [1, 2, 3],
        callback: vi.fn(),
      };
      
      const slots = {
        default: '<p>Main content</p>',
        'header-section': '<h1>Header</h1>',
        'footer_area': '<footer>Footer</footer>',
      };

      mockRenderJSX.mockResolvedValue('<div>complex rendered output</div>');

      const result = await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        props,
        slots
      );

      expect(result).toEqual({ html: '<div>complex rendered output</div>' });
      
      expect(mockJsx).toHaveBeenCalledWith(Component, {
        ...props,
        children: '<p>Main content</p>',
        headerSection: '<h1>Header</h1>',
        footerArea: '<footer>Footer</footer>',
      });
    });

    test('handles null and undefined values in props and slots', async () => {
      const Component = vi.fn();
      
      const props = {
        title: null,
        description: undefined,
        id: 'test',
      };
      
      const slots = {
        default: null,
        'optional-slot': undefined,
        'valid-slot': 'Valid content',
      };

      mockRenderJSX.mockResolvedValue('<div>handled nulls</div>');

      const result = await serverRenderer.renderToStaticMarkup.call(
        { result: {} },
        Component,
        props,
        slots
      );

      expect(result).toEqual({ html: '<div>handled nulls</div>' });
      
      expect(mockJsx).toHaveBeenCalledWith(Component, {
        title: null,
        description: undefined,
        id: 'test',
        children: null,
        optionalSlot: undefined,
        validSlot: 'Valid content',
      });
    });
  });
});