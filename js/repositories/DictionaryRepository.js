import { Word } from '../models/Word.js';
export class DictionaryRepository {
    constructor() {
        this.data = [
            new Word(1, '私', 'わたし', 'watashi', '我', ['N5']),
            new Word(2, '食べる', 'たべる', 'taberu', '吃', ['N5','動詞'])
        ];
    }
    async search(q) {
        if(!q) return [];
        return this.data.filter(w => w.kanji.includes(q) || w.kana.includes(q) || w.meaning.includes(q));
    }
}