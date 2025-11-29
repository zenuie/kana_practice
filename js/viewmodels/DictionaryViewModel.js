export class DictionaryViewModel {
    constructor(repo, tts) { this.repo = repo; this.tts = tts; }
    async search(q) { return await this.repo.search(q); }
    play(text) { this.tts.speak(text); }
}