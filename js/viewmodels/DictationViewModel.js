export class DictationViewModel {
    constructor(repo, tts, input, tokenizer) {
        this.repo = repo; this.tts = tts; this.input = input; this.tokenizer = tokenizer;
        this.questions = []; this.index = 0; this.checked = false;
        this.msg = ""; this.msgType = "";
    }
    async init() {
        this.questions = await this.repo.getPracticeQuestions();
        this.index = 0; this.reset();
    }
    get current() { return this.questions[this.index]; }

    async check(input) {
        if(!this.current) return;
        let kanaInput = await this.tokenizer.toHiragana(input);
        const isCorrect = (kanaInput === this.current.answer) || (input === this.current.answer);

        this.checked = true;
        if(isCorrect) {
            this.msgType = 'success'; this.msg = `正解！ (${kanaInput})`; this.tts.speak("正解");
        } else {
            this.msgType = 'danger'; this.msg = `錯誤... 正解: ${this.current.answer}`;
        }
        return isCorrect;
    }
    next() {
        if(this.index < this.questions.length - 1) {
            this.index++; this.reset(); return true;
        }
        return false;
    }
    reset() { this.checked = false; this.msg = ""; }
    play() { if(this.current) this.tts.speak(this.current.text); }
}