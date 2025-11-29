export class InferenceService {
    constructor() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.isSupported = false;
            return;
        }
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ja-JP';
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
    }

    listenOnce() {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) return reject("瀏覽器不支援");

            let finalTranscript = '';
            let hasResult = false;

            this.recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript = event.results[i][0].transcript;
                        hasResult = true;
                        this.recognition.stop();
                        resolve(finalTranscript);
                    }
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') reject("未偵測到聲音");
                else if (event.error === 'not-allowed') reject("麥克風權限被拒絕");
                else reject(event.error);
            };

            this.recognition.onend = () => {
                if (!hasResult) reject("請再說一次");
            };

            try { this.recognition.start(); } catch (e){}
        });
    }

    stop() {
        if (this.recognition) this.recognition.stop();
    }
}