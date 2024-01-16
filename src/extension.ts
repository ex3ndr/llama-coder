import * as vscode from 'vscode';
import { PromptProvider } from './prompts/provider';
import { info, registerLogger } from './modules/log';

export function activate(context: vscode.ExtensionContext) {

	// Create logger
	registerLogger(vscode.window.createOutputChannel('Llama Coder', { log: true }));
	info('Llama Coder is activated.');

	// Create status bar
	const openSettings = 'llama.openSettings';
	context.subscriptions.push(vscode.commands.registerCommand(openSettings, () => {
		vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ex3ndr.llama-coder');
	}));
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = openSettings;
	statusBarItem.text = `$(chip) Llama Coder`;
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Create provider
	const provider = new PromptProvider(statusBarItem, context);
	let disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**', }, provider);
	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Nothing to do now
}
