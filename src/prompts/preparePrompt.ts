import vscode from 'vscode';
import path from 'path';

export async function preparePrompt(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext) {

    // Load document text
    let text = document.getText();
    let offset = document.offsetAt(position);
    let prefix = text.slice(0, offset);
    let suffix = text.slice(offset);

    // Trim suffix
    // NOTE: It seems that most neural networks are built have a focus on last characters and we therefore need to trim them to not get weird results.
    // TODO: Better solution?
    // TODO: Am i right here? What if we would want to generate something that uses something in the end of the file?
    if (suffix.length > 256) {
        suffix = suffix.slice(0, 256);
    }

    // Add filename and language to prefix
    // NOTE: Most networks don't have a concept of filenames and expected language, but we expect that some files in training set has something in title that 
    //       would indicate filename and language
    // NOTE: We are building for typescript for now so we can use C-style comments to indicate filename
    let filename = path.basename(document.fileName);
    let language = document.languageId;
    let filenamePrefix = `/* ${language}, filename: ${filename} */`;
    prefix = filenamePrefix + '\n' + prefix;

    return {
        prefix,
        suffix,
    };
}