import { LanguageDescriptor } from "./languages";

export function comment(text: string, language: LanguageDescriptor): string | null {
    if (language.comment) {
        if (language.comment.end) {
            return `${language.comment.start} ${text} ${language.comment.end}`;
        } else {
            return `${language.comment.start} ${text}`;
        }
    }
    return null;
}