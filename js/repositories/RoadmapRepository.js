import { Level } from '../models/Level.js';
export class RoadmapRepository {
    async getLevels() {
        return [
            new Level('n5', 'N5 入門', '基礎日語', [{id:'n5-1', title:'自我介紹', isLocked:false}]),
            new Level('n4', 'N4 初級', '進階會話', [{id:'n4-1', title:'動詞變化', isLocked:true}])
        ];
    }
}