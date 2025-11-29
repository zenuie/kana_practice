import { QuestionRepository } from '../repositories/QuestionRepository.js';
import { TTSAudioService } from '../services/TTSAudioService.js';
import { InputService } from '../services/InputService.js';
import { TokenizerService } from '../services/TokenizerService.js';
import { InferenceService } from '../services/ai/InferenceService.js';
import { DictationViewModel } from '../viewmodels/DictationViewModel.js';

export const DictationView = {
    render() {
        return `
        <div class="container text-center mt-5" style="max-width: 600px;">
            <h3>🎧 拼寫特訓</h3>
            <div class="card p-4 shadow-sm mt-4">
                <div class="mb-3"><button id="play" class="btn btn-primary rounded-circle p-3">🔊</button></div>
                <div class="input-group mb-3">
                    <input id="inp" class="form-control text-center" placeholder="輸入...">
                    <button id="mic" class="btn btn-outline-danger">🎤</button>
                </div>
                <div id="msg" class="alert d-none"></div>
                <button id="check" class="btn btn-success w-100">檢查</button>
                <button id="next" class="btn btn-secondary w-100 d-none">下一題</button>
            </div>
        </div>`;
    },
    async afterRender() {
        const vm = new DictationViewModel(new QuestionRepository(), new TTSAudioService(), new InputService(), new TokenizerService());
        const ai = new InferenceService();
        vm.tokenizer.init(); // 預載字典
        await vm.init();

        const inp = document.getElementById('inp');
        const mic = document.getElementById('mic');
        const msg = document.getElementById('msg');
        const check = document.getElementById('check');
        const next = document.getElementById('next');

        new InputService().bind(inp); // 綁定 Wanakana

        const updateUI = () => {
            msg.className = `alert alert-${vm.msgType}`; msg.innerText = vm.msg;
            msg.classList.toggle('d-none', !vm.checked);
            check.classList.toggle('d-none', vm.checked);
            next.classList.toggle('d-none', !vm.checked);
            inp.disabled = vm.checked;
        };

        document.getElementById('play').onclick = () => vm.play();

        check.onclick = async () => {
            if(!inp.value) return;
            check.innerText = "轉換中..."; check.disabled = true;
            await vm.check(inp.value);
            check.innerText = "檢查"; check.disabled = false;
            updateUI();
        };

        next.onclick = () => { if(vm.next()) { inp.value=''; updateUI(); inp.focus(); } else alert("結束"); };

        mic.onclick = async () => {
            mic.classList.add('element-pulse', 'btn-danger');
            inp.placeholder = "請說話...";
            try {
                const text = await ai.listenOnce();
                inp.value = text;
                // 自動送出檢查 (可選)
                // check.click();
            } catch (e) { inp.placeholder = e; }
            finally { mic.classList.remove('element-pulse', 'btn-danger'); }
        };
    }
};