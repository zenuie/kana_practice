// js/views/KanaWritingView.js

import { KanaRepository } from '../repositories/KanaRepository.js';
import { AudioService } from '../services/AudioService.js';
import { DrawingService } from '../services/DrawingService.js';
import { HandwritingService } from '../services/ai/HandwritingService.js';
import { KanaWritingViewModel } from '../viewmodels/KanaWritingViewModel.js';

export const KanaWritingView = {
    render() {
        // 【修改】移除了 startOverlay 和 saveModal 的初始畫面
        // 【修改】移除了 statusBadge 和 btnCheck 按鈕
        return `
            <div id="saveModal" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-none flex-column justify-content-center align-items-center" style="z-index: 10000;">
                <h3 class="text-white mb-3">長按圖片加入照片</h3>
                <img id="saveImageDisplay" class="border border-4 border-white rounded" style="width: 250px; height: 250px; background: black;">
                <button id="btnCloseSave" class="btn btn-light mt-3">關閉</button>
            </div>

            <div class="container mt-3" style="max-width: 500px;">
                <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-white shadow-sm rounded">
                    <span class="fw-bold text-primary">🎌 拼寫特訓</span>
                    <span class="badge bg-light text-dark border">連對: <span id="streakCount">0</span></span>
                </div>

                <div class="card shadow-sm border-0 rounded-4">
                    <div class="card-body text-center bg-info-subtle position-relative">
                        <button id="btnPlay" class="btn btn-primary rounded-circle" style="width: 80px; height: 80px; font-size: 30px;">🔊</button>
                        
                        <div id="visualHint" class="display-1 fw-bold text-primary mt-2" style="display:none;"></div>
                        <div id="romajiHint" class="text-muted mt-1" style="display:none;"></div>
                        
                        <div class="mt-2">
                            <button id="btnHint" class="btn btn-sm btn-link text-decoration-none">💡 偷看提示</button>
                        </div>
                    </div>

                    <div class="position-relative bg-white border-top border-bottom" style="width: 100%; aspect-ratio: 1/1; cursor: crosshair;">
                         <div class="position-absolute w-100 h-100" style="background-image: linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px); background-size: 50% 50%; background-position: center; pointer-events: none;"></div>
                        <canvas id="drawingBoard" style="width: 100%; height: 100%;"></canvas>
                    </div>

                    <div class="card-footer bg-white p-3">
                        <div class="d-flex gap-2">
                            <button id="btnClear" class="btn btn-light border flex-fill">🗑️ 清除</button>
                            <button id="btnNext" class="btn btn-light border flex-fill">⏩ 跳過</button>
                        </div>
                    </div>

                    <!-- Feedback Overlay -->
                    <div id="feedbackOverlay" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-95 d-none flex-column justify-content-center align-items-center text-center" style="z-index: 20;">
                        <div id="fbIcon" style="font-size: 80px;"></div>
                        <h2 id="fbTitle" class="fw-bold"></h2>
                        <p id="fbDesc" class="text-muted mb-4"></p>
                        <div class="d-grid gap-2 w-75">
                            <button id="btnNextFeedback" class="btn btn-primary rounded-pill btn-lg shadow">下一題 ➔</button>
                            <div class="border-top pt-3 mt-2">
                                <small class="text-muted d-block mb-2">AI 判斷錯了嗎？</small>
                                <button id="btnWrong" class="btn btn-outline-danger btn-sm w-100 mb-2">❌ 其實我寫錯了</button>
                                <button id="btnForce" class="btn btn-outline-success btn-sm w-100">⭕ 其實我是對的 (存圖)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        const repo = new KanaRepository();
        const audio = new AudioService();
        const drawing = new DrawingService();
        const ai = new HandwritingService();
        const vm = new KanaWritingViewModel(repo, audio, drawing, ai);

        // 【修改】移除了 elStartOverlay 和 elStatus 的元素獲取
        const elFeedback = document.getElementById('feedbackOverlay');
        const elStreak = document.getElementById('streakCount');
        const elVisualHint = document.getElementById('visualHint');
        const elRomajiHint = document.getElementById('romajiHint');
        const elSaveModal = document.getElementById('saveModal');
        const elSaveImg = document.getElementById('saveImageDisplay');
        const btnPlay = document.getElementById('btnPlay');
        const btnHint = document.getElementById('btnHint');

        drawing.bind(document.getElementById('drawingBoard'));

        vm.onStateChange = (vmInstance, event) => {
            if (!event) {
                // 【修改】不再需要更新 AI 狀態 badge
                elStreak.innerText = vmInstance.streak;
                return;
            }

            if (event.type === 'state_update') {
                elStreak.innerText = vmInstance.streak;
            }

            // 【修改】恢復為聽寫模式的 UI 邏輯
            if (event.type === 'new_question') {
                elFeedback.classList.add('d-none');

                // 隱藏文字提示，顯示播放按鈕
                elVisualHint.style.display = 'none';
                elRomajiHint.style.display = 'none';
                btnPlay.style.display = 'inline-block';

                // 更新隱藏的提示內容
                elVisualHint.innerText = event.q.char;
                elRomajiHint.innerText = event.q.romaji;
            }

            if (event.type === 'feedback') {
                elFeedback.classList.remove('d-none');
                elFeedback.style.display = 'flex';

                const { result, isCorrect } = event;
                const icon = document.getElementById('fbIcon');
                const title = document.getElementById('fbTitle');
                const desc = document.getElementById('fbDesc');

                if (isCorrect) {
                    icon.innerText = '🎉';
                    title.innerText = '答對了！';
                    title.className = 'fw-bold text-success';
                    desc.innerText = `AI 看到：${result.char} (${result.confidence.toFixed(1)})`;
                } else {
                    icon.innerText = '🤔';
                    title.innerText = '嗯...不太像？';
                    title.className = 'fw-bold text-danger';
                    desc.innerText = `題目是「${vmInstance.currentQ.char}」，AI 看到「${result.char}」`;
                }
            }
        };

        // --- 事件綁定 ---

        // 【修改】移除了 btnStart 的點擊事件

        btnPlay.onclick = () => vm.playAudio();

        // 【修改】btnHint 的功能是顯示文字提示
        btnHint.onclick = () => {
            elVisualHint.style.display = 'block';
            elRomajiHint.style.display = 'block';
            btnPlay.style.display = 'none'; // 顯示文字後隱藏大播放鈕，避免雜亂
        };

        document.getElementById('btnClear').onclick = () => drawing.clear();
        document.getElementById('btnNext').onclick = () => vm.nextQuestion();

        // 【修改】移除了 btnCheck 的點擊事件，因為檢查是自動的

        document.getElementById('btnNextFeedback').onclick = () => vm.nextQuestion();
        document.getElementById('btnWrong').onclick = () => vm.markAsWrong();

        document.getElementById('btnForce').onclick = () => {
            const finalCanvas = vm.getDownloadImage();
            if (finalCanvas) {
                const dataUrl = finalCanvas.toDataURL("image/png");
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    elSaveImg.src = dataUrl;
                    elSaveModal.classList.remove('d-none');
                    elSaveModal.style.display = 'flex';
                } else {
                    const link = document.createElement('a');
                    link.download = `report_${Date.now()}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            vm.forceCorrect();
        };

        document.getElementById('btnCloseSave').onclick = () => {
            elSaveModal.classList.add('d-none');
        };

        // 直接初始化，開始練習
        vm.init();
    }
};