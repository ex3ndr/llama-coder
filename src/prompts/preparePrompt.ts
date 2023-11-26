import vscode from 'vscode';
import { detectLanguage } from './processors/detectLanguage';
import { fileHeaders } from './processors/fileHeaders';
import { languages } from './processors/languages';

export async function preparePrompt(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext) {

    // Load document text
    let text = document.getText();
    let offset = document.offsetAt(position);
    let prefix = text.slice(0, offset);
    let suffix: string | null = text.slice(offset);

    // Trim suffix
    // If suffix is too small it is safe to assume that it could be ignored which would allow us to use
    // more powerful completition instead of in middle one
    if (suffix.length < 256) {
        suffix = null;
    }

    // Add filename and language to prefix
    // NOTE: Most networks don't have a concept of filenames and expected language, but we expect that some files in training set has something in title that 
    //       would indicate filename and language
    // NOTE: If we can't detect language, we could ignore this since the number of languages that need detection is limited
    let language = detectLanguage(document.uri.fsPath, document.languageId);
    if (language) {
        prefix = fileHeaders(prefix, document.uri.fsPath, languages[language]);
    }

    return {
        prefix,
        suffix,
    };
}