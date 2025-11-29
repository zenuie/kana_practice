import { Kana } from '../models/Kana.js';

export class KanaRepository {
    constructor() {
        // 1. 原始資料 (Raw Data) - 來自你原本的 KANA_DB
        const rawData = [
            { r: 'a', h: 'あ' }, { r: 'i', h: 'い' }, { r: 'u', h: 'う' }, { r: 'e', h: 'え' }, { r: 'o', h: 'お' },
            { r: 'ka', h: 'か' }, { r: 'ki', h: 'き' }, { r: 'ku', h: 'く' }, { r: 'ke', h: 'け' }, { r: 'ko', h: 'こ' },
            { r: 'sa', h: 'さ' }, { r: 'shi', h: 'し' }, { r: 'su', h: 'す' }, { r: 'se', h: 'せ' }, { r: 'so', h: 'そ' },
            { r: 'ta', h: 'た' }, { r: 'chi', h: 'ち' }, { r: 'tsu', h: 'つ' }, { r: 'te', h: 'て' }, { r: 'to', h: 'と' },
            { r: 'na', h: 'な' }, { r: 'ni', h: 'に' }, { r: 'nu', h: 'ぬ' }, { r: 'ne', h: 'ね' }, { r: 'no', h: 'の' },
            { r: 'ha', h: 'は' }, { r: 'hi', h: 'ひ' }, { r: 'fu', h: 'ふ' }, { r: 'he', h: 'へ' }, { r: 'ho', h: 'ほ' },
            { r: 'ma', h: 'ま' }, { r: 'mi', h: 'み' }, { r: 'mu', h: 'む' }, { r: 'me', h: 'め' }, { r: 'mo', h: 'も' },
            { r: 'ya', h: 'や' }, { r: 'yu', h: 'ゆ' }, { r: 'yo', h: 'よ' },
            { r: 'ra', h: 'ら' }, { r: 'ri', h: 'り' }, { r: 'ru', h: 'る' }, { r: 're', h: 'れ' }, { r: 'ro', h: 'ろ' },
            { r: 'wa', h: 'わ' }, { r: 'wo', h: 'を' }, { r: 'n', h: 'ん' }
        ];

        // 2. 轉換為 Model 物件，並明確加上 audioFile
        // 這裡確保每個 Kana 物件都有 audioFile 屬性，對應到 assets/audio/pronounce/{r}.mp3
        this.items = rawData.map(k => new Kana(
            k.h,              // char (平假名)
            k.r,              // romaji
            'hiragana',       // type
            `${k.r}.mp3`      // audioFile (例如 a.mp3)
        ));

        this.labels = [];
    }

    /**
     * 取得單一隨機假名 (給手寫練習用)
     */
    getRandomKana() {
        return this.items[Math.floor(Math.random() * this.items.length)];
    }

    /**
     * 取得依「行」分組的二維陣列 (給五十音圖 Chart 用)
     */
    getSeion() {
        const rows = [];
        const chunkSize = 5; // 每一行有 5 個字 (a, i, u, e, o)

        for (let i = 0; i < this.items.length; i += chunkSize) {
            // 特別處理 'y', 'w' 行的中空部分，或是 'n' 單獨一行
            // 這裡為了簡單，直接每 5 個切一組，呈現時會自動換行
            const chunk = this.items.slice(i, i + chunkSize);
            
            // 為了讓 View 知道這一行的代表字 (例如 'a' 行, 'ka' 行)
            const rowName = chunk[0].romaji.charAt(0) === 'a' || chunk[0].romaji.length === 1 
                            ? 'a' // 母音行
                            : chunk[0].romaji.slice(0, -1); // 子音 (k, s, t...)

            rows.push({
                row: rowName,
                items: chunk
            });
        }
        return rows;
    }

    /**
     * 載入模型標籤 (給手寫辨識用)
     */
    async loadLabels() {
        if (this.labels.length > 0) return this.labels;

        try {
            const res = await fetch('./assets/json/labels.json');
            if (res.ok) {
                this.labels = await res.json();
            } else {
                console.warn("找不到 labels.json，使用預設 fallback");
                // Fallback: 如果讀不到檔案，假設 labels 順序跟 db 一樣 (這取決於你訓練時的順序)
                this.labels = this.items.map(k => k.romaji); 
            }
        } catch (e) {
            console.warn("Labels error", e);
        }
        return this.labels;
    }
}