export class Question {
    constructor(id, text, answer, translation) {
        this.id = id;
        this.text = text;       // 顯示的文字 (如果有的話，聽寫通常隱藏)
        this.answer = answer;   // 正確答案 (平假名)
        this.translation = translation; // 中文翻譯
    }
}