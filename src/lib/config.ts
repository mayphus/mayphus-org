export const config = {
	uniorgPlugins: [
		customFrontmatter,
	],
};

function customFrontmatter() {
	return (_tree: any, file: any) => {
		const keywords = file.data.keywords || {};

		if (keywords.date) {
            const dateMatch = keywords.date.match(/\[(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
				keywords.date = dateMatch[1];
			}
		}

		keywords.filetags = Array.isArray(keywords.filetags)
		? keywords.filetags
		: typeof keywords.filetags === 'string'
		? keywords.filetags.split(':').filter(Boolean)
		: [];

        file.data.astro.frontmatter = {
            ...file.data.astro.frontmatter,
			...keywords,
		};
	};
}
