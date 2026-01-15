/* eslint-disable @typescript-eslint/no-explicit-any */

export class EditorManager {
  constructor(private view: any) {}

  public isEmptyDocument(): boolean {
    const nodes = this.view.state.doc.content.content;
    return nodes.length === 1 && nodes[0].content.content.length === 0;
  }

  public isCurrentLineEmpty(): boolean {
    const anchor = this.view.state.selection.$anchor;
    return anchor.parent.textContent.trim().length === 0;
  }

  public isFollowingLinesEmpty(): boolean {
    const anchor = this.view.state.selection.$anchor;
    const cursorPos = anchor.pos;
    const endPos = this.view.state.doc.content.size;

    return (
      this.view.state.doc.textBetween(cursorPos, endPos, '\n', '\n').trim()
        .length === 0
    );
  }

  public isFirstLine(): boolean {
    const firstNode = this.view.state.doc.content.content[0];
    const cursorPos = this.view.state.selection.$anchor.pos;

    return firstNode.content.size >= cursorPos - 1;
  }

  public isLastLine(): boolean {
    const nodes = this.view.state.doc.content;
    const lastNode = nodes.content[nodes.content.length - 1];
    const cursorPos = this.view.state.selection.$anchor.pos;

    return nodes.size - lastNode.content.size - 1 <= cursorPos;
  }

  public removeEmptyLines(): void {
    const state = this.view.state;
    const doc = state.doc;
    const anchor = state.selection.$anchor;
    const nodeStart = anchor.start();
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

  public getFirstLineEndPosition(): number {
    const firstNode = this.view.state.doc.content.content[0];
    return firstNode.content.size + 1;
  }
}
