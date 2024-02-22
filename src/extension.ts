import * as vscode from 'vscode';
import { PromptProvider } from './prompts/provider';
import { info, registerLogger } from './modules/log';

export function activate(context: vscode.ExtensionContext) {

	// Create logger
	registerLogger(vscode.window.createOutputChannel('Llama Coder', { log: true }));
	info('Llama Coder is activated.');

	// Create status bar
	context.subscriptions.push(vscode.commands.registerCommand('llama.openSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ex3ndr.llama-coder');
	}));

	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'llama.toggle';
	statusBarItem.text = `$(chip) Llama Coder`;
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Create provider
	const provider = new PromptProvider(statusBarItem, context);
	let disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**', }, provider);
	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand('llama.pause', () => {
		provider.paused = true;
	}));
	context.subscriptions.push(vscode.commands.registerCommand('llama.resume', () => {
		provider.paused = false;
	}));
	context.subscriptions.push(vscode.commands.registerCommand('llama.toggle', () => {
		provider.paused = !provider.paused;
	}));

}

export function deactivate() {
	// Nothing to do now
}
