export class RoadmapViewModel {
    constructor(repo) { this.repo = repo; }
    async init() { return await this.repo.getLevels(); }
    startLesson(id) { localStorage.setItem('lessonId', id); window.router.navigate('dictation'); }
}