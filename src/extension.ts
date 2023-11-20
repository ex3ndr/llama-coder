import * as vscode from 'vscode';
import { PromptProvider } from './prompts/provider';
import { registerLogger } from './modules/log';

export function activate(context: vscode.ExtensionContext) {

	// Create logger
	registerLogger(vscode.window.createOutputChannel('Ollama Coder', { log: true }));

	// Create provider
	const provider = new PromptProvider();
	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**', }, provider);
}

export function deactivate() {
	// Nothing to do now
}
