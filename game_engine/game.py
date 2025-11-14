"""Base Game interface."""

import json


class QuestionInfo:
    title: str
    cost: int


class Game:
    """Base class for game logic. All game methods should be synchronous."""
    topic_name = 'Окружающий мир'

    def __init__(self) -> None:
        self._load_data()
        self.teams_scores = {}

    def list_teams(self) -> list[str]:
        """List all teams in the game."""
        lst_teams = input('Введите имена команд через запятую: ').split(',')
        return lst_teams

    def set_current_team(self, team_name: str) -> None:
        """Set the current team for the game."""
        self.current_team = team_name
        if team_name not in self.teams_scores:
            self.teams_scores[team_name] = 0

    def count_score(self, price, is_correct):
        if is_correct:
            self.teams_scores[self.current_team] += price
        else:
            self.teams_scores[self.current_team] -= price

    def get_team_score(self, team_name: str) -> int:
        """Передает общий счет команды по запросу"""
        team_score = self.teams_scores[team_name]
        return team_score

    def list_questions_and_prices(self) -> list[dict]:
        self.question_and_prices_list = []
        question_and_prices_dict = [
            {k: d[k] for k in ("title", "price")} for d in self.file_data
        ]
        return question_and_prices_dict

    def get_variants_for_question(self, question_index: int) -> list[str]:
        """Get the variants for a question."""
        return self.file_data[question_index]["variants"]

    def submit_answer(self, question_index, answer: str, price) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        is_correct = self.file_data[question_index]["correct_answer"] == answer
        self.count_score(price, is_correct)
        return is_correct

    def _load_data(self):
        """Load questions from the folder."""
        self.file_data = []
        for i in range(100, 1000, 100):
            with open(
                f"game_engine/resources/game_questions/{self.topic_name}/{i}.json",
                encoding="utf-8",
            ) as file:
                data = json.load(file)
                data["price"] = i
                self.file_data.append(data)
