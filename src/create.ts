import { window, commands, ExtensionContext, Terminal } from "vscode";
import {
  getPathHack,
  uniqBy,
  getWorkSpaceFolders,
  getProjectPath,
} from "./utils";
import { StatusBarTerminal, MyTerminalOptions } from "./StatusBarTerminal";

const MAX_TERMINALS = 10;
let terminalCount = 0;
let terminalIndex: number;
let terminals: StatusBarTerminal[] = [];

// 命令
export interface ShellType {
  key: string; // 脚本名
  value: string; // 脚本内容
  environment?: string; // 脚本环境
}

/**
 * Shows a pick list using window.showQuickPick().
 */
export async function showQuickPick() {
  let i = 0;
  const result = await window.showQuickPick(["eins", "zwei", "drei"], {
    placeHolder: "eins, zwei or drei",
    onDidSelectItem: (item) =>
      window.showInformationMessage(`Focus ${++i}: ${item}`),
  });
  window.showInformationMessage(`Got: ${result}`);
}

/**
 * 输入组件名称
 */
export async function getComponentName() {
  const reg = /^[_a-zA-Z][_a-zA-Z0-9\-]*$/;
  return await window.showInputBox({
    title: "组件名称",
    prompt: "请输入需要创建的组件名称",
    value: "",
    // valueSelection: [2, 4],
    placeHolder: "例如：GameList",
    validateInput: (text) => {
      //   window.showInformationMessage(`Validating: ${text}`);
      return reg.test(text) ? null : "请输入正确的组件名称";
      //   return text === "123" ? "Not 123!" : null;
    },
  });
}

/**
 * 输入组件描述
 */
export async function getComponentDescription() {
    return await window.showInputBox({
      title: "组件描述",
      prompt: "请输入创建组件的描述",
      value: "",
      placeHolder: "例如：游戏列表组件",
      validateInput: (text) => {
        //   window.showInformationMessage(`Validating: ${text}`);
        return !!text ? null : "请输入组件描述";
      },
    });
  }

// 关闭终端
function onDidCloseTerminal(terminal: Terminal): void {
  terminals.forEach((statusBarTerminal, index) => {
    if (statusBarTerminal.hasTerminal(terminal)) {
      terminalIndex = index;
    }
  });
  terminals[terminalIndex]?.dispose();
  terminals.splice(terminalIndex, 1);
//   terminals.forEach((statusBarTerminal, i) => {
//     terminals[i].setTerminalIndex(i);
//   });
  terminalCount--;
}

// 创建分割拆分终端
async function createNewSplitTerminal(
  terminalIndex: number,
  terminalOptions: MyTerminalOptions
): Promise<Terminal> {
  return new Promise(async () => {
    // 通过命令创建的终端是默认的终端信息，暂未发现此命令可以通过传参配置生成的命令
    // 解决方案就是构造一个StatusBarTerminal实例，再updateTerminal
    await commands.executeCommand("workbench.action.terminal.split");
    const activeTerminal = window.activeTerminal;
    const splitInstance = new StatusBarTerminal(
      terminalIndex,
      terminalOptions,
      false
    );
    if (activeTerminal && terminalOptions?.terminalAutoInputText) {
      if (terminalOptions?.terminalText) {
        activeTerminal.sendText(
          terminalOptions.terminalText,
          terminalOptions.terminalAutoRun
        );
      }
    }
    splitInstance.updateTerminal(activeTerminal);
    terminals.push(splitInstance);
  });
}

function init(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "code-template.createComponent",
      async (args: {
        title: string;
        shell: ShellType;
        fsPath: string;
        [key: string]: any;
      }) => {
        console.log(args, "所有参数");

        const name = await getComponentName();
        if (!name) {
          return;
        }

        const description = await getComponentDescription();
        if (!description) {
            return;
        }

        const { path } = args;
        const root = getProjectPath(path);
        const projectName = root.split("/").pop();
        const componentPath = path.replace(root, "");
        
        // 高配：填充脚本、支持分屏、自动运行项目、多项目终端切换
        // 1.1 获取当前所有运行的终端数量（去重）
        const uniqTerminals = uniqBy(terminals, "terminalName");
        // 1.2 尝试获取当前点击的项目脚本是否存在终端实例
        const currentProjectTerminal = uniqTerminals.find(
          (t) => t.terminalName === projectName
        );
        // 1.3 如果当前的项目脚本并不存在终端实例，新增
        if (!currentProjectTerminal) {
          terminals.push(
            new StatusBarTerminal(terminalCount++, {
              // terminalCwd: getPathHack(path),
              terminalCwd: getPathHack(root),
              terminalName: projectName,
              terminalText: `yarn cli add ${componentPath}/${name} -c ${description}`,
              terminalAutoInputText: true,
              terminalAutoRun: true,
            })
          );
        }
        // 1.4 当前项目脚本存在终端实例
        if (currentProjectTerminal) {
          // 1.4.1 用户设置不需要分屏，则新增
          //   if (!splitTerminal) {
          //     terminals.push(
          //       new StatusBarTerminal(terminalCount++, {
          //         terminalCwd: getPathHack(path),
          //         terminalName: projectName,
          //         terminalText: `npm run ${shell?.key}`,
          //         terminalAutoInputText: true,
          //         terminalAutoRun: autoRunTerminal,
          //       })
          //     );
          //   } else {
          currentProjectTerminal?.show();
          await createNewSplitTerminal(terminalCount++, {
            terminalCwd: getPathHack(root),
            terminalName: projectName,
            terminalText: `yarn cli add ${path}/${name} -c 测试`,
            terminalAutoInputText: true,
            terminalAutoRun: true,
          });
          //   }
        }

        context.subscriptions.push(
          window.onDidCloseTerminal(onDidCloseTerminal)
        );
      }
    )
  );
}

module.exports = function (context: ExtensionContext) {
  init(context);
  //   let reloadExtensionCommand = commands.registerCommand(
  //     "BeeHive-Command.refresh",
  //     () => {
  //       commands.executeCommand("workbench.action.restartExtensionHost");
  //     }
  //   );
  //   context.subscriptions.push(reloadExtensionCommand);
};
