import * as vscode from "vscode";

// 终端参数配置
export interface MyTerminalOptions extends vscode.TerminalOptions {
  terminalCwd: string; // 执行目录
  terminalName?: string; // 终端名称
  terminalText?: string; // 终端填充内容
  terminalAutoInputText?: boolean; // 是否自动填充终端内容
  terminalAutoRun?: boolean; // 是否自动运行
}

/**
 * @description 终端
 * @property {number} terminalIndex 终端下标
 * @property {object} terminalOptions 配置参数
 * @property {boolean} terminalCreate 默认生成 terminal
 * 具体参数可阅读: https://code.visualstudio.com/api/references/vscode-api#TerminalOptions
 */
export class StatusBarTerminal {
//   private _item: vscode.StatusBarItem;
  private _terminal: vscode.Terminal | undefined;
  public terminalName: string | undefined;
  public terminalIndex: number | undefined;

  constructor(
    terminalIndex: number,
    terminalOptions: MyTerminalOptions,
    terminalCreate: boolean = true
  ) {
    this.terminalIndex = terminalIndex;
    this.terminalName = terminalOptions?.terminalName;
    // this._item = vscode.window.createStatusBarItem();
    // this.setTerminalIndex(terminalIndex);
    // this._item.show();

    if (terminalCreate) {
      this._terminal = vscode.window.createTerminal({
        cwd: terminalOptions?.terminalCwd,
        name: terminalOptions?.terminalName,
        hideFromUser: true
      });

      if (terminalOptions?.terminalAutoInputText) {
        if (terminalOptions?.terminalText) {
          this._terminal.sendText(
            terminalOptions.terminalText,
            terminalOptions.terminalAutoRun
          );
        }
      }
    //   this._terminal.show();
    }
  }

  public show(): void {
    this._terminal?.show();
  }

//   public setTerminalIndex(index: number): void {
//     this._item.text = `$(terminal)${index + 1}`;
//   }

  // 更新terminal信息（use split terminal）
  public updateTerminal(terminal: vscode.Terminal | undefined) {
    if (terminal) {
      this._terminal = terminal;
    }
  }

  public hasTerminal(terminal: vscode.Terminal): boolean {
    return this._terminal === terminal;
  }

  public dispose(): void {
    // this._item.dispose();
    this._terminal?.dispose();
  }
}
