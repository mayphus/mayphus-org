// correct date, filetags and save to frontmatter
export const customKeywords = () => {
	return (_tree: any, file: any) => {
		const keywords = file.data.keywords || {};

		if (keywords.date) {
			const dateMatch = keywords.date
				.match(/\[(\d{4}-\d{2}-\d{2}) (\w{3}) (\d{2}:\d{2})\]/);
			if (dateMatch) {
				const [, datePart, _dayPart, timePart] = dateMatch;
				const date = new Date(`${datePart}T${timePart}`);
				keywords.date = date;
			}
		}

		keywords.filetags = Array.isArray(keywords.filetags)
		? keywords.filetags
		: typeof keywords.filetags === 'string'
		? keywords.filetags.split(':').filter(Boolean)
		: [];

		const fileName = file.history[0].split('/').pop() || '';
		const slugWithoutTimestamp = fileName.replace(/^\d{8}T\d{6}--/, '');
		const slug = slugWithoutTimestamp.split('__')[0].replace('.org', '').toLowerCase();

        file.data.astro.frontmatter = {
            ...file.data.astro.frontmatter,
			...keywords,
			slug: slug,
		};
	};
}
