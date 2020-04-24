"use strict";
import * as vscode from "vscode";
import * as path from "path";
import * as tildify from "tildify";
import * as untildify from "untildify";
import * as clipboardy from "clipboardy";

function findOccurances(
  doc: vscode.TextDocument,
  position: vscode.Position
): Array<number> {
  var line = doc.lineAt(position.line);
  const content: string = line.text;
  const startString: string = content.substring(0, position.character);
  const startSingle: number = startString.lastIndexOf("'");
  const startDouble: number = startString.lastIndexOf('"');
  const start: number = startSingle > startDouble ? startSingle : startDouble;

  var end;
  const endString: string = content.substring(position.character);

  if (startSingle > startDouble) {
    end = endString.indexOf("'") + position.character;
  } else {
    end = endString.indexOf('"') + position.character;
  }
  const path: string = content.substring(start, end);

  if (path.indexOf("/") === -1) return;
  return [start, end];
}

const getEditor = (): vscode.TextEditor | undefined => {
  const editor: vscode.TextEditor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No file open.");
    return;
  }
  return editor;
};

const getSelectedText = (editor: vscode.TextEditor): string | undefined => {
  const selectedText: string = editor.document.getText(editor.selection);
  if (!selectedText) {
    vscode.window.showErrorMessage("No text selected.");
    return;
  }
  return selectedText;
};

const getInputs = () => {
  const editor: vscode.TextEditor | undefined = getEditor();
  const selectedText: string | undefined = getSelectedText(editor);
  return { editor, selectedText };
};

const setOutput = (editor, text) => {
  editor.edit((editBuilder) => {
    editBuilder.delete(editor.selection);
    editBuilder.insert(editor.selection.start, text);
  });
};

export const activate = (context: vscode.ExtensionContext) => {
  // make path relative to current file
  const relative = vscode.commands.registerCommand("pathTools.relative", () => {
    const { editor, selectedText } = getInputs();
    console.log(editor);
    console.log(selectedText);
    if (editor == undefined || selectedText == undefined) return;
    const currentFilePath: string = path.dirname(editor.document.uri.fsPath);
    const relativePath: string = path.relative(currentFilePath, selectedText);
    setOutput(editor, relativePath);
  });

  // resolve path relative to the current file
  const resolve = vscode.commands.registerCommand("pathTools.resolve", () => {
    const { editor, selectedText } = getInputs();
    if (editor == undefined || selectedText == undefined) return;
    const currentFilePath: string = path.dirname(editor.document.uri.fsPath);
    const resolvedPath: string = path.resolve(currentFilePath, selectedText);
    setOutput(editor, resolvedPath);
  });

  // normalize the path
  const normalize = vscode.commands.registerCommand(
    "pathTools.normalize",
    () => {
      const { editor, selectedText } = getInputs();
      if (editor == undefined || selectedText == undefined) return;
      const normalizedPath: string = path.normalize(selectedText);
      setOutput(editor, normalizedPath);
    }
  );

  // change path to posix
  const posix = vscode.commands.registerCommand("pathTools.posix", () => {
    const { editor, selectedText } = getInputs();
    if (editor == undefined || selectedText == undefined) return;
    const posixPath: string = selectedText.replace(/\\+/g, "/");
    setOutput(editor, posixPath);
  });

  // change path to windows
  const windows = vscode.commands.registerCommand("pathTools.windows", () => {
    const { editor, selectedText } = getInputs();
    if (editor == undefined || selectedText == undefined) return;
    const windowsPath: string = selectedText.replace(/[\/\\]/g, "\\\\");
    setOutput(editor, windowsPath);
  });

  // convert home dir to ~
  const tilda = vscode.commands.registerCommand("pathTools.tilda", () => {
    const { editor, selectedText } = getInputs();
    if (editor == undefined || selectedText == undefined) return;
    const fixedPath: string = tildify(selectedText);
    if (fixedPath === selectedText) {
      vscode.window.showErrorMessage(
        "Home directory don't exist in the selected path."
      );
      return;
    }
    setOutput(editor, fixedPath);
  });

  // convert ~ to home dir
  const untilda = vscode.commands.registerCommand("pathTools.untilda", () => {
    const { editor, selectedText } = getInputs();
    if (editor == undefined || selectedText == undefined) return;
    const fixedPath: string = untildify(selectedText);
    if (fixedPath === selectedText) {
      vscode.window.showErrorMessage(" ~ don't exist in the selected path.");
      return;
    }
    setOutput(editor, fixedPath);
  });

  // copy currentfile path to clipboard
  const copy = vscode.commands.registerCommand("pathTools.copy", () => {
    const editor: vscode.TextEditor = getEditor();
    if (editor == undefined) return;
    const currentFilePath: string = editor.document.uri.fsPath;
    clipboardy.writeSync(currentFilePath);
    vscode.window.showInformationMessage(
      `${currentFilePath} copied to clipboard.`
    );
  });

  // select the path under cursor in the quotes
  const select = vscode.commands.registerCommand("pathTools.select", () => {
    const editor: vscode.TextEditor = getEditor();
    if (editor == undefined) return;
    let selection = findOccurances(editor.document, editor.selection.active);
    if (!selection) {
      vscode.window.showErrorMessage("No file paths found.");
      return;
    }
    // select the text
    const startPos = new vscode.Position(
      editor.selection.active.line,
      selection[0] + 1
    );
    const endPos = new vscode.Position(
      editor.selection.active.line,
      selection[1]
    );
    const newSel = new vscode.Selection(startPos, endPos);
    editor.selection = newSel;
  });

  const commands = [
    relative,
    resolve,
    normalize,
    posix,
    windows,
    tilda,
    untilda,
    copy,
    select,
  ];
  commands.forEach((command) => {
    context.subscriptions.push(command);
  });
};
