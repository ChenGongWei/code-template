import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// 工程文件类型
export interface FolderType {
  name: string;
  path: string;
}

/**
 * @description 因为 vscode 支持 Multi-root 工作区，暴力解决
 * @summary 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
 * @link https://code.visualstudio.com/docs/editor/multi-root-workspaces
 */
function getWorkSpaceFolders() {
  const folders: FolderType[] = [];
  vscode?.workspace?.workspaceFolders?.forEach((folder: any) => {
    folders.push({
      name: folder.name,
      path: folder.uri.path,
    });
  });
  return folders;
}

/**
 * @description 获取操作系统平台
 */
function isWinOS() {
  return os.platform() === "win32";
}

function isMacOS() {
  return os.platform() === "darwin";
}

/**
 *@description 得到正确的地址，兼容window上的问题
 */
function getPathHack(filePath: string) {
  if (isWinOS()) {
    return filePath.slice(1);
  }
  return filePath;
}

/**
 * @description 字符串去除首尾空格
 */
function trim(str: string) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * @description 数组去重
 * @param {Array} arr
 * @param {string} iteratee
 */
function uniqBy(arr: any[], iteratee: string) {
  return arr !== null && arr.length ? objUniq(arr, iteratee) : [];
}

/**
 * @description 对象去重
 */
function objUniq(arr: any[], iteratee: string) {
  let uniqMaps: { [key: string]: any } = {};
  arr.forEach((ele: { [key: string]: any }, index: number) => {
    if (!uniqMaps[ele[iteratee]]) {
      // 默认采用第一个出现的数据为准
      uniqMaps[ele[iteratee]] = index;
    }
  });
  const result = Object.keys(uniqMaps).map((key: string) => {
    return arr[uniqMaps[key]];
  });
  return result;
}

/**
 * 获取当前所在工程根目录
 */
function getProjectPath(currentFile: string) {
  const document = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.document
    : null;

  if (!document) {
    return "";
  }
  //   const currentFile = document.uri.fsPath;
  let projectPath = null;

  let workspaceFolders =
    vscode.workspace.workspaceFolders?.map((item) => item.uri.path) || [];
  // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
  // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
  if (
    workspaceFolders.length === 1 &&
    workspaceFolders[0] === vscode.workspace.rootPath
  ) {
    const rootPath = workspaceFolders[0];
    const files = fs.readdirSync(rootPath);
    const isRoot = files.some((name) => name === 'package.json');
    if (!isRoot) {
        workspaceFolders = files
            .filter((name) => !/^\./g.test(name))
            .map((name) => path.resolve(rootPath, name));
    }
  }
  workspaceFolders.forEach((folder) => {
    if (currentFile.indexOf(folder) === 0) {
      projectPath = folder;
    }
  });
  if (!projectPath) {
    return "";
  }
  return projectPath;
}

export {
  isMacOS,
  isWinOS,
  getPathHack,
  trim,
  getWorkSpaceFolders,
  uniqBy,
  getProjectPath,
};
