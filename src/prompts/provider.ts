import vscode from 'vscode';
import { info } from '../modules/log';
import { autocomplete, isSupported } from './autocomplete';
import { preparePrompt } from './preparePrompt';
import { AsyncLock } from '../modules/lock';

export class PromptProvider implements vscode.InlineCompletionItemProvider {

    lock = new AsyncLock();

    async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined | null> {

        // Ignore unsupported documents
        if (!isSupported(document)) {
            info(`Unsupported document: ${document.uri.toString()} ignored.`);
            return;
        }

        // Ignore if already canceled
        if (token.isCancellationRequested) {
            info(`Canceled before AI completion.`);
            return;
        }

        // Execute in lock
        return await this.lock.inLock(async () => {
            // Prepare context
            let prepared = await preparePrompt(document, position, context);
            if (token.isCancellationRequested) {
                info(`Canceled before AI completion.`);
                return;
            }

            // Run AI completion
            info(`Running AI completion...`);
            let res = await autocomplete({
                prefix: prepared.prefix,
                suffix: prepared.suffix,
                endpoint: 'http://127.0.0.1:11434/',
                model: 'codellama:13b-code-q6_K',
                canceled: () => token.isCancellationRequested,
            });
            if (token.isCancellationRequested) {
                info(`Canceled after AI completion.`);
                return;
            }
            info(`AI completion completed: ${res}`);

            // Return result
            if (res.trim() !== '') {
                return [{
                    insertText: res,
                    range: new vscode.Range(position, position),
                }];
            }

            // Nothing to complete
            return;
        });
    }
}