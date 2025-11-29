// js/models/Level.js
export class Level {
    constructor(id, title, description, lessons = []) {
        this.id = id;           // e.g., 'n5'
        this.title = title;     // e.g., 'JLPT N5'
        this.description = description;
        this.lessons = lessons; // Array of objects { id, title, isLocked }
    }
}