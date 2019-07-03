'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var resolver = require('./resolver');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
function openFile(fileName) {
    vscode.workspace
        .openTextDocument(fileName)
        .then(vscode.window.showTextDocument);
}
function prompt(fileName, cb) {
    var options = {
        placeHolder: "Create " + fileName + "?"
    };
    vscode.window.showQuickPick(["Yes", "No"], options)
        .then(function (answer) {
        if (answer === "Yes") {
            cb();
        }
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.railsGoToSpec', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        var document = editor.document;
        var fileName = document.fileName;
        var related = resolver.getRelated(fileName);
        var relative = vscode.workspace.asRelativePath(related);
        var fileExists = fs.existsSync(related);
        var dirname = path.dirname(related);
        //console.log('fileExists', fileExists);
        if (fileExists) {
            openFile(related);
        }
        else {
            prompt(relative, function () {
                mkdirp.sync(dirname);
                fs.closeSync(fs.openSync(related, 'w'));
                openFile(related);
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map