export type ModelFormat = 'codellama' | 'deepseek' | 'stable-code';

export function adaptPrompt(args: { format: ModelFormat, prefix: string, suffix: string }): { prompt: string, stop: string[] } {

    // Common non FIM mode
    // if (!args.suffix) {
    //     return {
    //         prompt: args.prefix,
    //         stop: [`<END>`]
    //     };
    // }

    // Starcoder FIM
    if (args.format === 'deepseek') {
        return {
            prompt: `<｜fim▁begin｜>${args.prefix}<｜fim▁hole｜>${args.suffix}<｜fim▁end｜>`,
            stop: [`<｜fim▁begin｜>`, `<｜fim▁hole｜>`, `<｜fim▁end｜>`, `<END>`]
        };
    }

    // Stable code FIM
    if (args.format === 'stable-code') {
        return {
            prompt: `<fim_prefix>${args.prefix}<fim_suffix>${args.suffix}<fim_middle>`,
            stop: [`<|endoftext|>`]
        };
    }

    // Codellama FIM
    return {
        prompt: `<PRE> ${args.prefix} <SUF> ${args.suffix} <MID>`,
        stop: [`<END>`, `<EOD>`, `<EOT>`]
    };
}