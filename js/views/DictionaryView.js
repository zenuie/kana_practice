import { DictionaryRepository } from '../repositories/DictionaryRepository.js';
import { TTSAudioService } from '../services/TTSAudioService.js';
import { DictionaryViewModel } from '../viewmodels/DictionaryViewModel.js';
export const DictionaryView = {
    render: () => `<div class="container mt-4"><input id="q" class="form-control mb-3" placeholder="搜尋..."><div id="res" class="list-group"></div></div>`,
    afterRender: () => {
        const vm = new DictionaryViewModel(new DictionaryRepository(), new TTSAudioService());
        const res = document.getElementById('res');
        document.getElementById('q').addEventListener('input', async (e) => {
            const r = await vm.search(e.target.value);
            res.innerHTML = r.map(w => `<button class="list-group-item list-group-item-action d-flex justify-content-between">
                <div><span class="h5 text-primary">${w.kanji}</span> (${w.kana}) - ${w.meaning}</div>
                <span class="btn btn-sm btn-light">🔊</span></button>`).join('');
            res.querySelectorAll('button').forEach((b, i) => b.onclick = () => vm.play(r[i].kana));
        });
    }
};