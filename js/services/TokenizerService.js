/* global kuromoji, wanakana */
export class TokenizerService {
    constructor() {
        this.tokenizer = null;
        this.dicPath = "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/";
    }

    async init() {
        if (this.tokenizer) return;
        return new Promise((resolve, reject) => {
            kuromoji.builder({ dicPath: this.dicPath }).build((err, tokenizer) => {
                if (err) reject(err);
                else {
                    this.tokenizer = tokenizer;
                    resolve();
                }
            });
        });
    }

    async toHiragana(text) {
        if (!this.tokenizer) await this.init();
        const tokens = this.tokenizer.tokenize(text);
        const katakana = tokens.map(t => t.reading || t.surface_form).join("");
        return wanakana.toHiragana(katakana);
    }
}