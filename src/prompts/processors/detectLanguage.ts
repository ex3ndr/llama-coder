import path from 'path';
import { Language, languages } from './languages';

let aliases: { [key: string]: Language } = {
    'typescriptreact': 'typescript',
    'javascriptreact': 'javascript',
    'jsx': 'javascript'
};

export function detectLanguage(uri: string, languageId: string | null): Language | null {

    // Resolve aliases
    if (!!languageId && aliases[languageId]) {
        return aliases[languageId];
    }

    // Resolve using language id
    if (!!languageId && !!languages[languageId as Language]) {
        return languageId as Language;
    }

    // Resolve using filename and extension
    let basename = path.basename(uri);
    let extname = path.extname(basename).toLowerCase();

    // Check extensions
    for (let lang in languages) {
        let k = languages[lang as Language];
        for (let ex of k.extensions) {
            if (extname === ex) {
                return lang as Language;
            }
        }
    }

    // Return result
    return null;
}