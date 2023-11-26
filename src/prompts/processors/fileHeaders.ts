import { comment } from "./comment";
import { LanguageDescriptor } from "./languages";

export function fileHeaders(content: string, uri: string, language: LanguageDescriptor | null) {
    let res = content;
    if (language) {

        // Add path marker
        let pathMarker = comment('Path: ' + uri, language);
        if (pathMarker) {
            res = pathMarker + '\n' + res;
        }

        // Add language marker
        let typeMarker = comment('Language: ' + language.name, language);
        if (typeMarker) {
            res = typeMarker + '\n' + res;
        }
    }
    return res;
}