import * as vscode from 'vscode';
import { PromptProvider } from './prompts/provider';
import { info, registerLogger } from './modules/log';

export function activate(context: vscode.ExtensionContext) {

	// Create logger
	registerLogger(vscode.window.createOutputChannel('Llama Coder', { log: true }));
	info('Llama Coder is activated.');

	// Create provider
	const provider = new PromptProvider();
	let disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**', }, provider);
	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Nothing to do now
}
