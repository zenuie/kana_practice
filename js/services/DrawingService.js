export class DrawingService {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;

        // 這些是回調函數，由外部 (ViewModel) 注入
        this.onInteractStart = null; // 對應原本的 app.cancelAutoCheck
        this.onInteractEnd = null;   // 對應原本的 app.startAutoCheck
    }

    bind(canvasElement) {
        this.canvas = canvasElement;
        // 使用你原本的設定
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.resize();

        const start = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            this.isDrawing = true;
            this.ctx.beginPath();
            const p = this.getPos(e);
            this.ctx.moveTo(p.x, p.y);

            // 原本的 app.cancelAutoCheck()
            if (this.onInteractStart) this.onInteractStart();
        };

        const move = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            if (this.isDrawing) {
                const p = this.getPos(e);
                this.ctx.lineTo(p.x, p.y);
                this.ctx.stroke();
            }
        };

        const end = () => {
            this.isDrawing = false;
            // 原本的 app.startAutoCheck()
            if (this.onInteractEnd) this.onInteractEnd();
        };

        // 綁定事件 (保留原本邏輯)
        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', move);
        this.canvas.addEventListener('mouseup', end);
        this.canvas.addEventListener('touchstart', start, { passive: false });
        this.canvas.addEventListener('touchmove', move, { passive: false });
        this.canvas.addEventListener('touchend', end);

        // Resize 處理
        new ResizeObserver(() => this.resize()).observe(this.canvas.parentElement);
    }

    resize() {
        const wrapper = this.canvas.parentElement;
        if (wrapper) {
            this.canvas.width = wrapper.clientWidth;
            this.canvas.height = wrapper.clientWidth; // 保持正方形
            this.clear();
        }
    }

    getPos(e) {
        const r = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = this.canvas.width / r.width;
        const scaleY = this.canvas.height / r.height;
        return {
            x: (clientX - r.left) * scaleX,
            y: (clientY - r.top) * scaleY
        };
    }

    clear() {
        // 保留原本的樣式設定
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = 'black';

        if (this.onInteractStart) this.onInteractStart(); // 清除時也要 cancelAutoCheck
    }

    isEmpty() {
        const d = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        for (let i = 0; i < d.length; i += 4) if (d[i] < 255) return false;
        return true;
    }
}