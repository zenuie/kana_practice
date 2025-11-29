// js/viewmodels/KanaWritingViewModel.js

import { KanaRepository } from '../repositories/KanaRepository.js';

export class KanaWritingViewModel {
    constructor(repo, audioService, drawingService, handwritingService) {
        this.repo = repo;
        this.audio = audioService;
        this.drawing = drawingService;
        this.ai = handwritingService;

        this.streak = 0;
        this.currentQ = null;
        this.aiStatus = "載入中...";
        this.autoCheckTimer = null;

        // 綁定 DrawingService 的回調
        this.drawing.onInteractStart = () => this.cancelAutoCheck();
        this.drawing.onInteractEnd = () => this.startAutoCheck();

        this.onStateChange = null; // 用來通知 View 更新 UI
    }

    async init() {
        const labels = await this.repo.loadLabels();
        const success = await this.ai.init(labels);
        this.aiStatus = success ? "AI 就緒" : "AI 失敗";
        this.nextQuestion();
        this.notifyState();
    }

    unlockAudio() {
        // AudioService 沒有 unlock 方法，直接開始
        this.nextQuestion();
    }

    nextQuestion() {
        this.currentQ = this.repo.getRandomKana();
        this.drawing.clear();
        setTimeout(() => this.playAudio(), 500);
        this.notify({ type: 'new_question', q: this.currentQ });
    }

    playAudio() {
        if (this.currentQ) {
            // 使用正確的方法名 playLocal 和參數 audioFile
            this.audio.playLocal(this.currentQ.audioFile);
        }
    }

    toggleHint() {
        return this.currentQ;
    }

    startAutoCheck() {
        if (this.autoCheckTimer) clearTimeout(this.autoCheckTimer);
        this.autoCheckTimer = setTimeout(() => {
            this.checkAnswer();
        }, 1200);
    }

    cancelAutoCheck() {
        if (this.autoCheckTimer) {
            clearTimeout(this.autoCheckTimer);
            this.autoCheckTimer = null;
        }
    }

    async checkAnswer() {
        if (this.drawing.isEmpty()) return;

        const result = await this.ai.predict(this.drawing.canvas);
        if (!result) return;

        // 【最終修正】同時比對假名 (char) 和羅馬拼音 (romaji)，讓判斷更準確
        const isCorrect = (result.char === this.currentQ.char || result.char === this.currentQ.romaji);

        if (isCorrect) this.streak++;
        else this.streak = 0;

        this.notify({
            type: 'feedback',
            result: result,
            isCorrect: isCorrect
        });

        if(isCorrect) {
             setTimeout(() => this.playAudio(), 200);
        }
    }

    forceCorrect() {
        this.streak++;
        this.notifyState();
        setTimeout(() => this.nextQuestion(), 1500);
    }

    markAsWrong() {
        this.streak = 0;
        this.notifyState();
        this.nextQuestion();
    }

    getDownloadImage() {
        return this.ai.getFormattedImage(this.drawing.canvas);
    }

    notifyState() {
        this.notify({ type: 'state_update' });
    }

    notify(event) {
        if (this.onStateChange) this.onStateChange(this, event);
    }
}