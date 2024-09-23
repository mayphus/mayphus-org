import { visit } from 'unist-util-visit';

function writeDenoteLinksMap(tree: any, file: any) {
	const identifierAndSlugMap = new Map();
	const filePath = file.history[0];
	let fileName = filePath.split('/').pop();

	const slug = fileName.replace(/\.org$/, '').toLowerCase();

	identifierAndSlugMap.set(file.data.keywords.identifier, slug);
	return identifierAndSlugMap;
}

export const replaceDenoteLinks = () => {
	return (tree: any, file: any) => {
		// First pass: Create the identifier and slug map
		const identifierAndSlugMap = writeDenoteLinksMap(tree, file);

		// Second pass: Replace fuzzy denote links
		visit(tree, 'link', (node: any) => {
			if (node.linkType === 'fuzzy') {
				// Extract the identifier from node.rawLink
				const identifierMatch = node.rawLink.match(/denote:(\d{8}T\d{6})/);
				if (identifierMatch) {
					const identifier = identifierMatch[1];
					
					// Query the identifierAndSlugMap to get the slug
					const slug = identifierAndSlugMap.get(identifier);
					
					if (slug) {
						// Prepend /node/ to the slug
						const formattedSlug = `/node/${slug}`;
						
						// Replace node.rawLink and node.path with the formatted slug
						node.rawLink = formattedSlug;
						node.path = formattedSlug;
						node.linkType = 'file';
					}
					console.log(node);
				}
			}
		});
	};
};
