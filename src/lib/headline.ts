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

export function customHeadlineColor() {
  return (tree: any) => {
    visit(tree, 'headline', (node: Headline) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      
      switch (node.level) {
        case 2:
          node.data.hProperties.style = 'color: #FF595E;';
          break;
        case 3:
          node.data.hProperties.style = 'color: #FFCA3A;';
          break;
        case 4:
          node.data.hProperties.style = 'color: #8AC926;';
          break;
        case 5:
          node.data.hProperties.style = 'color: #1982C4;';
          break;
        case 6:
          node.data.hProperties.style = 'color: #6A4C93;';
          break;
      }
    })
  }
}
