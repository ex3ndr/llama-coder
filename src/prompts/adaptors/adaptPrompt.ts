export function adaptPrompt(args: { model: string, prefix: string, suffix: string }): string {

    // Starcoder format
    if (args.model.startsWith('deepseek-coder')) {
        return `<｜fim▁begin｜>${args.prefix}<｜fim▁hole｜>${args.suffix}<｜fim▁end｜>`;
    }

    // Codellama format
    return `<PRE> ${args.prefix} <SUF>${args.suffix} <MID>`;
}