import { HomeView } from './views/HomeView.js';
import { KanaView } from './views/KanaView.js';
import { DictationView } from './views/DictationView.js';
import { RoadmapView } from './views/RoadmapView.js';
import { DictionaryView } from './views/DictionaryView.js';
// 1. 引入新 View
import { KanaWritingView } from './views/KanaWritingView.js';

export const routes = {
    'home': HomeView,
    'kana': KanaView,
    'dictation': DictationView,
    'roadmap': RoadmapView,
    'dict': DictionaryView,
    'writing': KanaWritingView // 2. 加入這行，key 叫做 'writing'
};