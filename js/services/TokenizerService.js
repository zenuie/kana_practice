export class TokenizerService {
    constructor() {
        this.tokenizer = null;
        // 【修正】將 dicPath 指向專案內部的相對路徑
        this.dicPath = "./kuromoji/dict/";
    }

    async init() {
        if (this.tokenizer) return;
        return new Promise((resolve, reject) => {
            kuromoji.builder({ dicPath: this.dicPath }).build((err, tokenizer) => {
                if (err) {
                    // 增加更詳細的錯誤日誌
                    console.error("Kuromoji build failed. Check if dicPath is correct and files exist.", err);
                    reject(err);
                }
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