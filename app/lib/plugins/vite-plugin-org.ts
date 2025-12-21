import { type Plugin } from 'vite';
import { createFilter } from 'vite';
import { compile, type CompileOptions } from '@uniorgjs/orgx';
import { VFile } from 'vfile';

interface Options extends CompileOptions {
    include?: string | string[];
    exclude?: string | string[];
}

export default function org(options: Options = {}): Plugin {
    const { include, exclude, ...compileOptions } = options;
    const filter = createFilter(include, exclude);

    return {
        name: 'vite-plugin-custom-org',
        async transform(value: string, path: string) {
            if (!path.endsWith('.org') || !filter(path)) {
                return;
            }

            const file = new VFile({ value, path });

            try {
                const compiled = await compile(file, compileOptions);

                let code = String(compiled.value);

                // Manually inject attributes export from file.data.frontmatter
                // We prioritize attributes -> frontmatter
                const attributes = file.data.attributes || file.data.frontmatter || {};

                // Ensure we don't double export if orgx already did (but it didn't)
                // We use JSON.stringify to safely serialize the object
                code += `\nexport const attributes = ${JSON.stringify(attributes)};`;

                // Also export filename or other metadata if needed
                code += `\nexport const filename = ${JSON.stringify(path)};`;

                return { code, map: compiled.map };
            } catch (e) {
                console.error(`Error compiling ${path}:`, e);
                throw e;
            }
        },
    };
}
