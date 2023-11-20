import type vscode from 'vscode';

export class PromptProvider implements vscode.InlineCompletionItemProvider {

    async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined | null> {
        // TODO: Implement
        return;
    }
}