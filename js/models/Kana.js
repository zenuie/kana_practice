export class Kana {
    /**
     * @param {string} char - 顯示文字 (あ)
     * @param {string} romaji - 羅馬拼音 (a)
     * @param {string} type - 類型 (hiragana)
     * @param {string} audioFile - 檔名 (a.mp3)
     */
    constructor(char, romaji, type, audioFile) {
        this.char = char;
        this.romaji = romaji;
        this.type = type;
        this.audioFile = audioFile;
    }
}