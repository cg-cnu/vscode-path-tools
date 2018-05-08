"use strict";
import * as vscode from "vscode";
import * as path from "path";
import * as tildify from "tildify";
import * as untildify from "untildify";
import * as clipboardy from "clipboardy";
import { start } from "repl";

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

export const activate = (context: vscode.ExtensionContext) => {
  // replace current selected path with the relative path
  const relative = vscode.commands.registerCommand("pathTools.relative", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const currentFilePath: string = path.dirname(editor.document.uri.fsPath);
    const relativePath: string = path.relative(currentFilePath, selectedPath);
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, relativePath);
    });
  });
  context.subscriptions.push(relative);

  // replace current selected path to full path
  const resolve = vscode.commands.registerCommand("pathTools.resolve", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    var selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const currentFilePath: string = path.dirname(editor.document.uri.fsPath);
    const relativePath: string = path.resolve(currentFilePath, selectedPath);
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, relativePath);
    });
  });
  context.subscriptions.push(resolve);

  // replace current selected path with the normalized path
  const normalize = vscode.commands.registerCommand(
    "pathTools.normalize",
    () => {
      const editor: vscode.TextEditor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No file open.");
        return;
      }
      var selectedPath: string = editor.document.getText(editor.selection);
      if (!selectedPath) {
        vscode.window.showErrorMessage("No selected path.");
        return;
      }
      const normalizedPath: string = path.normalize(selectedPath);

      editor.edit(editBuilder => {
        editBuilder.delete(editor.selection);
        editBuilder.insert(editor.selection.start, normalizedPath);
      });
    }
  );
  context.subscriptions.push(normalize);

  // convert current selected path to posix path
  const posix = vscode.commands.registerCommand("pathTools.posix", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const fixedPath: string = selectedPath.replace(/\\+/g, "/");
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, fixedPath);
    });
  });
  context.subscriptions.push(posix);

  // replace current selected path with windows path
  const windows = vscode.commands.registerCommand("pathTools.windows", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const fixedPath: string = selectedPath.replace(/[\/\\]/g, "\\\\");
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, fixedPath);
    });
  });
  context.subscriptions.push(windows);

  // convert home dir to ~ in the current selected path
  const tilda = vscode.commands.registerCommand("pathTools.tilda", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const fixedPath: string = tildify(selectedPath);
    if (fixedPath === selectedPath) {
      vscode.window.showErrorMessage(
        "Home directory don't exist in the selected path."
      );
      return;
    }
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, fixedPath);
    });
  });
  context.subscriptions.push(tilda);

  // convert ~ to home dir in the current selected path
  const untilda = vscode.commands.registerCommand("pathTools.untilda", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const selectedPath: string = editor.document.getText(editor.selection);
    if (!selectedPath) {
      vscode.window.showErrorMessage("No selected path.");
      return;
    }
    const fixedPath: string = untildify(selectedPath);
    if (fixedPath === selectedPath) {
      vscode.window.showErrorMessage(" ~ don't exist in the selected path.");
      return;
    }
    editor.edit(editBuilder => {
      editBuilder.delete(editor.selection);
      editBuilder.insert(editor.selection.start, fixedPath);
    });
  });
  context.subscriptions.push(untilda);

  // copy currentfile path to clipboard
  const copy = vscode.commands.registerCommand("pathTools.copy", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }
    const currentFilePath: string = editor.document.uri.fsPath;
    clipboardy.writeSync(currentFilePath);
    vscode.window.showInformationMessage(
      `${currentFilePath} copied to clipboard.`
    );
  });
  context.subscriptions.push(copy);

  const select = vscode.commands.registerCommand("pathTools.select", () => {
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }

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
};
