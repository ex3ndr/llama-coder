import vscode from 'vscode';
import { detectLanguage } from './processors/detectLanguage';
import { fileHeaders } from './processors/fileHeaders';
import { languages } from './processors/languages';
import { config } from '../config';

var decoder = new TextDecoder("utf8");

function getNotebookDocument(document: vscode.TextDocument): vscode.NotebookDocument | undefined  {
    return  vscode.workspace.notebookDocuments
        .find(x => x.uri.path === document.uri.path);
}

export async function preparePrompt(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext) {

    // Load document text
    let text = document.getText();
    let offset = document.offsetAt(position);
    let prefix = text.slice(0, offset);
    let suffix: string = text.slice(offset);

    let notebookConfig = config.notebook;

    // If this is a notebook, add the surrounding cells to the prefix and suffix
    let notebookDocument = getNotebookDocument(document);
    let language = detectLanguage(document.uri.fsPath, document.languageId);
    let commentStart: string | undefined = undefined;
    if (language) {
        commentStart = languages[language].comment?.start;
    }

    if (notebookDocument) {
        let beforeCurrentCell = true;

        let prefixCells = "";
        let suffixCells = "";

        notebookDocument.getCells().forEach((cell) => {
            let out = "";

            if (cell.document.uri.fragment === document.uri.fragment) {
                beforeCurrentCell = false; // switch to suffix mode
                return;
            }
            
            // add the markdown cell output to the prompt as a comment
            if (cell.kind === vscode.NotebookCellKind.Markup && commentStart) {
                if (notebookConfig.includeMarkup) {
                    for (const line of cell.document.getText().split('\n')) {
                        out += `\n${commentStart}${line}`;
                    }
                }
            } else {
                out += cell.document.getText();
            }

            // if there is any outputs add them to the prompt as a comment
            const addCellOutputs = notebookConfig.includeCellOutputs
                                    && beforeCurrentCell
                                    && cell.kind === vscode.NotebookCellKind.Code
                                    && commentStart;
            if (addCellOutputs) {
                let cellOutputs = cell.outputs
                    .map(x => x.items
                                .filter(x => x.mime === 'text/plain')
                                .map(x => decoder.decode(x.data))
                                .map(x => x.slice(0, notebookConfig.cellOutputLimit).split('\n')))
                    .flat(3);
                
                if (cellOutputs.length > 0) {
                    out += `\n${commentStart}Output:`;
                    for (const line of cellOutputs) {
                        out += `\n${commentStart}${line}`;
                    }
                }
            }

            // update the prefix/suffix
            if (beforeCurrentCell) {
                prefixCells += out;
            } else {
                suffixCells += out;
            }

        });

        prefix = prefixCells + prefix;
        suffix = suffix + suffixCells;
    }

    // Trim suffix
    // If suffix is too small it is safe to assume that it could be ignored which would allow us to use
    // more powerful completition instead of in middle one
    // if (suffix.length < 256) {
    //     suffix = null;
    // }

    // Add filename and language to prefix
    // NOTE: Most networks don't have a concept of filenames and expected language, but we expect that some files in training set has something in title that 
    //       would indicate filename and language
    // NOTE: If we can't detect language, we could ignore this since the number of languages that need detection is limited
    if (language) {
        prefix = fileHeaders(prefix, document.uri.fsPath, languages[language]);
    }

    return {
        prefix,
        suffix,
    };
}