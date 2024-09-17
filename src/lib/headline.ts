import { visit } from 'unist-util-visit';

interface Headline extends Node {
    type: 'headline'
    level: number
    data: {
        hProperties: {
            style: string
        }
        id: string
    }
}

export function customHeadline() {
  return (tree: any) => {
    visit(tree, 'headline', (node: Headline) => { 
      console.log(node)     
      if (node.level < 6) {
        node.level += 1
      }
    })
  }
}
