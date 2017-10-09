'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

export const activate = (context: vscode.ExtensionContext) => {
    
    // replace current selected path with the relative path
    const relative = vscode.commands.registerCommand('pathTools.relative', () => {
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        // get the selection 
        var selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }
        // get current file
        const currentFilePath: string = editor.document.uri.fsPath;
        // calculate the relative path
        const relativePath: string = path.relative(currentFilePath, selectedPath).replace(/[\/\\]/g, '\/')
        // replace current selection with the relative path
        editor.edit(editBuilder => {
            // delete the selected path
            editBuilder.delete(editor.selection);
            // insert the relative path
            editBuilder.insert(editor.selection.start, relativePath);
        })
    });
    context.subscriptions.push(relative);

    // replace current selected path to full path
    const resolve = vscode.commands.registerCommand('pathTools.resolve', () => {
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        // get the selection 
        var selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }
        // get current file
        const currentFilePath: string = editor.document.uri.fsPath;
        // calculate the relative path
        const relativePath: string = path.resolve(currentFilePath, selectedPath).replace(/[\/\\]/g, '\/')
        // replace current selection to full path
        editor.edit(editBuilder => {
            // delete the selected path
            editBuilder.delete(editor.selection);
            // insert the relative path
            editBuilder.insert(editor.selection.start, relativePath);
        })
    });
    context.subscriptions.push(resolve);

    // replace current selected path with the relative path
    const normalize = vscode.commands.registerCommand('pathTools.normalize', () => {
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        // get the selection 
        var selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }
        // calculate the relative path
        const normalizedPath: string = path.normalize(selectedPath).replace(/[\/\\]/g, '\/');
        
        // replace current selection with the relative path
        editor.edit(editBuilder => {
            // delete the selected path
            editBuilder.delete(editor.selection);
            // insert the relative path
            editBuilder.insert(editor.selection.start, normalizedPath);
        })
    });
    context.subscriptions.push(normalize);

    // convert path to posix
    const posix = vscode.commands.registerCommand('pathTools.posix', () => {
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        // get the selection 
        const selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }
        const fixedPath: string = selectedPath.replace(/\\+/g, '/');
        // replace current selection with the relative path
        editor.edit(editBuilder => {
            // delete the selected path
            editBuilder.delete(editor.selection);
            // insert the relative path
            editBuilder.insert(editor.selection.start, fixedPath);
        })
    });
    context.subscriptions.push(posix);

    // convert path to posix
    const windows = vscode.commands.registerCommand('pathTools.windows', () => {
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        // get the selection 
        const selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }
        const fixedPath: string = selectedPath.replace(/[\/\\]/g, '\\\\');
        // replace current selection with the relative path
        editor.edit(editBuilder => {
            // delete the selected path
            editBuilder.delete(editor.selection);
            // insert the relative path
            editBuilder.insert(editor.selection.start, fixedPath);
        })
    });
    context.subscriptions.push(windows);

    // TODO: created by salapati @ 2017-10-6 22:22:14
    // select the path in the present line with out user input
    // make it global for all the above functions ?

}
// TODO: created by salapati @ 2017-10-8 12:29:56
// remove if not necessary for all the ext
export const deactivate = () => { }