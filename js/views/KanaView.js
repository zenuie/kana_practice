import {KanaRepository} from '../repositories/KanaRepository.js';
import {AudioService} from '../services/AudioService.js';
import {KanaViewModel} from '../viewmodels/KanaViewModel.js';

export const KanaView = {
    render: () => `<div id="kana-grid" class="text-center mt-4"></div>`,
    afterRender: () => {
        const vm = new KanaViewModel(new KanaRepository(), new AudioService());
        const container = document.getElementById('kana-grid');
        vm.getKanaRows().forEach(row => {
            const d = document.createElement('div');
            d.className = 'mb-3';
            row.items.forEach(k => {
                const b = document.createElement('button');
                b.className = 'btn btn-outline-primary m-1';
                b.innerHTML = `<div class="h4 mb-0">${k.char}</div><small>${k.romaji}</small>`;
                b.onclick = () => vm.play(k);
                d.appendChild(b);
            });
            container.appendChild(d);
        });
    }
};