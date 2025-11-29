export class AudioService {
    playLocal(filename) {
        if (!filename) return;
        new Audio(`./assets/audio/pronounce/${filename}`).play().catch(e => console.warn(e));
    }
}