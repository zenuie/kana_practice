import {RoadmapRepository} from '../repositories/RoadmapRepository.js';
import {RoadmapViewModel} from '../viewmodels/RoadmapViewModel.js';

export const RoadmapView = {
    render: () => `<div class="container mt-4"><div class="accordion" id="rm"></div></div>`,
    afterRender: async () => {
        const vm = new RoadmapViewModel(new RoadmapRepository());
        const levels = await vm.init();
        const c = document.getElementById('rm');
        levels.forEach(l => {
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.innerHTML = `<h2 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#c${l.id}">${l.title}</button></h2>
            <div id="c${l.id}" class="accordion-collapse collapse"><div class="accordion-body list-group">
            ${l.lessons.map(ls => `<button class="list-group-item list-group-item-action" onclick="window.router.navigate('dictation')">${ls.title}</button>`).join('')}
            </div></div>`;
            c.appendChild(item);
        });
    }
};