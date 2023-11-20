export function countLines(src: string) {
    return countSymbol(src, '\n') + 1;
}

export function isBlank(src: string) {
    return src.trim().length === 0;
}

export function indentWidth(src: string) {
    for (let i = 0; i < src.length; i++) {
        if (!isBlank(src[i])) {
            return i;
        }
    }
    return src.length;
}

export function trimIndent(src: string) {

    // Prase lines
    let lines = src.split('\n');
    if (lines.length === 0) {
        return '';
    }
    if (lines.length === 1) {
        return lines[0].trim();
    }

    // Remove first and last empty line
    if (isBlank(lines[0])) {
        lines = lines.slice(1);
    }
    if (isBlank(lines[lines.length - 1])) {
        lines = lines.slice(0, lines.length - 1);
    }
    if (lines.length === 0) {
        return '';
    }

    // Find minimal indent
    let indents = lines.filter((v) => !isBlank(v)).map((v) => indentWidth(v));
    let minimal = indents.length > 0 ? Math.min(...indents) : 0;

    // Trim indent
    return lines.map((v) => isBlank(v) ? '' : v.slice(minimal).trimEnd()).join('\n');
}

export function trimEndBlank(src: string) {
    let lines = src.split('\n');
    for (let i = lines.length - 1; i++; i >= 0) {
        if (isBlank(lines[i])) {
            lines.splice(i);
        }
    }
    return lines.join('\n');
}

export function countSymbol(src: string, char: string) {
    let res = 0;
    for (let i = 0; i < src.length; i++) {
        if (src[i] === char) {
            res++;
        }
    }
    return res;
}