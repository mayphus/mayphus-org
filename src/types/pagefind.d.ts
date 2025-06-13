declare module '@pagefind/default-ui' {
  export class PagefindUI {
    constructor(options: {
      element: HTMLElement;
      showSubResults?: boolean;
      showImages?: boolean;
      excerptLength?: number;
    });
  }
}