// js/models/Word.js
export class Word {
    constructor(id, kanji, kana, romaji, meaning, tags = []) {
        this.id = id;
        this.kanji = kanji;     // 漢字 (如: 食べる)
        this.kana = kana;       // 假名 (如: たべる)
        this.romaji = romaji;   // 羅馬拼音 (如: taberu)
        this.meaning = meaning; // 中文意思
        this.tags = tags;       // 標籤 (如: N5, 動詞)
    }
}