/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DocumentState {
  isEmptyDocument: boolean;
  isCurrentLineEmpty: boolean;
  isFollowingLinesEmpty: boolean;
}

export class EditorManager {
  constructor(private view: any) {
    this.view = view;
  }

  public isEmptyDocument(): boolean {
    const nodes = this.view.state.doc.content.content;

    return nodes.length === 1 && nodes[0].content.content.length === 0;
  }

  public isCurrentLineEmpty(): boolean {
    const ancher = this.view.state.selection.$anchor;
    return ancher.parent.textContent.trim().length === 0;
  }

  public isFollowingLinesEmpty(): boolean {
    const ancher = this.view.state.selection.$anchor;
    const cursorPos = ancher.pos;
    const endPos = this.view.state.doc.content.size;

    return (
      this.view.state.doc.textBetween(cursorPos, endPos, '\n', '\n').trim()
        .length === 0
    );
  }

  public isFirstLine(): boolean {
    const firstNode = this.view.state.doc.content.content[0];
    const cursorPos = this.view.state.selection.$anchor.pos;

    if (firstNode.content.size >= cursorPos - 1) {
      return true;
    }

    return false;
  }

  public isLastLine(): boolean {
    const nodes = this.view.state.doc.content;
    const lastNode = nodes.content[nodes.content.length - 1];
    const cursorPos = this.view.state.selection.$anchor.pos;

    if (nodes.size - lastNode.content.size - 1 <= cursorPos) {
      return true;
    }

    return false;
  }

  public removeEmptyLines(): void {
    const state = this.view.state;
    const doc = state.doc;
    const ancher = state.selection.$anchor;
    const nodeStart = ancher.start();
    const endPos = doc.content.size;
    const tr = state.tr.delete(nodeStart - 1, endPos);
    this.view.dispatch(tr);
  }

  public getCursorOffset(): number {
    return this.view.state.selection.$anchor.parentOffset ?? 0;
  }

  public getLastLineStartPosition(): number {
    const nodes = this.view.state.doc.content;
    const lastNode = nodes.content[nodes.content.length - 1];

    return nodes.size - lastNode.content.size - 1;
  }
}
