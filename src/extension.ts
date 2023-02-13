// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from 'vscode';

import { showQuickPick, showInputBox } from './create';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// 激活扩展时调用此方法
// 您的扩展在命令第一次执行时即被激活
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-template" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('code-template.createComponent', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from code-template!');
	// });

    console.log('BeeHive 插件已启动，忙去吧～');
    require('./create')(context);

	// context.subscriptions.push(commands.registerCommand('code-template.createComponent', (args: any) => {
    //     console.log(args, '所有参数');
    //     const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
    //         showQuickPick,
    //         showInputBox,
    //         // multiStepInput,
    //         // quickOpen,
    //     };
    //     const quickPick = window.createQuickPick();
    //     quickPick.items = Object.keys(options).map(label => ({ label }));
    //     quickPick.onDidChangeSelection(selection => {
    //         if (selection[0]) {
    //             options[selection[0].label](context)
    //                 .catch(console.error);
    //         }
    //     });
    //     quickPick.onDidHide(() => quickPick.dispose());
    //     quickPick.show();
    // }));
}

// This method is called when your extension is deactivated
export function deactivate() {}
