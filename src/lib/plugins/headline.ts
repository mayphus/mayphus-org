import { visit } from 'unist-util-visit';

interface Headline extends Node {
    type: 'headline'
    level: number
}

// fix headline level to meet seo standard
export const customHeadline = () => {  
  return (tree: any) => {
    visit(tree, 'headline', (node: Headline) => { 
      if (node.level < 6) {
        // Increment headline level, but cap at 6 (max HTML heading level)
        node.level = Math.min(node.level + 1, 6);
      }
    })
  }
}
