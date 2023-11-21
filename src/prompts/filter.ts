import type vscode from 'vscode';

export function isSupported(doc: vscode.TextDocument) {
    return doc.uri.scheme === 'file';
}

export function isNotNeeded(doc: vscode.TextDocument, position: vscode.Position): boolean {

    // Avoid autocomplete on empty lines
    const line = doc.lineAt(position.line).text.trim();
    if (line.trim() === '') {
        return true;
    }

    return false;
}