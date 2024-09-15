import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const notes = await getCollection('notes');
	const articles = await getCollection('articles');

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: [...notes, ...articles]
			.map((item) => ({
				...item.data,
				link: `/${item.collection}/${item.slug}/`,
				pubDate: item.data.date,
				categories: [item.collection],
			})),
	});
}
