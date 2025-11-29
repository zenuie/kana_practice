/* global ort */

export class HandwritingService {
    constructor() {
        this.session = null;
        this.modelPath = './assets/models/handwriting/hiragana.onnx'; // 請確認路徑
        this.labels = [];
    }

    async init(labels) {
        this.labels = labels;
        try {
            const option = { executionProviders: ['wasm'] };
            this.session = await ort.InferenceSession.create(this.modelPath, option);
            return true;
        } catch (e) {
            console.error("AI Init Failed:", e);
            return false;
        }
    }

    // 對應原本 app.checkAnswer 的核心部分
    async predict(canvasElement) {
        if (!this.session) return null;

        const inputTensor = this.processCanvasForONNX(canvasElement);
        if (!inputTensor) return null;

        try {
            const feeds = { input: inputTensor };
            const results = await this.session.run(feeds);
            const outputData = results.output.data;

            let maxVal = -Infinity, maxIdx = -1;
            for (let i = 0; i < outputData.length; i++) {
                if (outputData[i] > maxVal) {
                    maxVal = outputData[i];
                    maxIdx = i;
                }
            }

            const aiChar = this.labels[maxIdx];
            // 保留你的對應表修正
            const mapFix = {"ta": "た", "te": "て", "ha": "は", "he": "へ", "ho": "ほ"};
            const displayChar = mapFix[aiChar] || aiChar;

            return { char: displayChar, confidence: maxVal };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // --- 以下完全保留你的原始邏輯 ---

    processCanvasForONNX(sourceCanvas) {
        const processedCanvas = this.createBlackBgImage(sourceCanvas, 64);
        if (!processedCanvas) return null;
        const ctx = processedCanvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, 64, 64);
        const { data } = imgData;
        const floatData = new Float32Array(3 * 64 * 64);
        for (let i = 0; i < 64 * 64; i++) {
            const r = data[i * 4] / 255.0;
            floatData[i] = r;
            floatData[64 * 64 + i] = r;
            floatData[2 * 64 * 64 + i] = r;
        }
        return new ort.Tensor('float32', floatData, [1, 3, 64, 64]);
    }

    createBlackBgImage(sourceCanvas, targetSize = 300) {
        const ctx = sourceCanvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let minX = width, minY = height, maxX = 0, maxY = 0, found = false;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (data[(y * width + x) * 4] < 200) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }
        if (!found) return null;

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        const padding = Math.floor(targetSize * 0.1);

        const scale = Math.min((targetSize - padding * 2) / cropW, (targetSize - padding * 2) / cropH);
        const sw = Math.floor(cropW * scale);
        const sh = Math.floor(cropH * scale);
        const dx = Math.floor((targetSize - sw) / 2);
        const dy = Math.floor((targetSize - sh) / 2);

        const finalC = document.createElement('canvas');
        finalC.width = targetSize;
        finalC.height = targetSize;
        const fCtx = finalC.getContext('2d');

        fCtx.fillStyle = "black";
        fCtx.fillRect(0, 0, targetSize, targetSize);

        const tempC = document.createElement('canvas');
        tempC.width = targetSize;
        tempC.height = targetSize;
        const tCtx = tempC.getContext('2d');

        tCtx.fillStyle = "white";
        tCtx.fillRect(0, 0, targetSize, targetSize);
        tCtx.drawImage(sourceCanvas, minX, minY, cropW, cropH, dx, dy, sw, sh);

        const tData = tCtx.getImageData(0, 0, targetSize, targetSize);
        const pixels = tData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const val = pixels[i];
            const newVal = val > 128 ? 0 : 255;
            pixels[i] = newVal;
            pixels[i + 1] = newVal;
            pixels[i + 2] = newVal;
            pixels[i + 3] = 255;
        }

        fCtx.putImageData(tData, 0, 0);
        return finalC;
    }

    // 為了相容存圖功能，把 helper 暴露出來
    getFormattedImage(canvas) {
        return this.createBlackBgImage(canvas, 300);
    }
}