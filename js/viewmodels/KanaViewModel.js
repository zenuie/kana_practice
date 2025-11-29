export class KanaViewModel {
    constructor(repo, audio) {
        this.repo = repo;
        this.audio = audio;
    }

    getKanaRows() {
        return this.repo.getSeion();
    }

    play(kana) {
        this.audio.playLocal(kana.audioFile);
    }
}