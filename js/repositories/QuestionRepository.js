import { Question } from '../models/Question.js';
export class QuestionRepository {
    async getPracticeQuestions() {
        return [
            new Question(1, "私は学生です", "わたしはがくせいです", "我是學生"),
            new Question(2, "猫が好きです", "ねこがすきです", "我喜歡貓")
        ];
    }
}