"""Base Game interface."""

from dataclasses import dataclass
from .question_catalog import QuestionCatalog


@dataclass
class Team:
    name: str
    score: int = 0


class Game:
    """Base class for game logic. All game methods should be synchronous."""

    _teams_info: dict[str, Team]
    _question_catalog: QuestionCatalog
    _current_team_index: int


    def __init__(self):
        self._question_catalog = QuestionCatalog()
        self._current_team_index = 0
        self._teams_info = {}

    def get_category_list(self) -> list[str]:
        return self._question_catalog.get_category_list()

    def set_current_category(self, selected_category: str):
        return self._question_catalog.set_current_category(selected_category)
        
    def get_selected_category(self) -> str | None:
        return self._question_catalog.get_selected_category()

    def get_current_questions(self) -> list[str]:
        """Передает список вопросов"""
        return self._question_catalog.get_current_questions()

    def get_prices(self) -> list[int]:
        """Передает цены вопросов"""
        return self._question_catalog.get_prices()

    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        return self._question_catalog.get_variants_for_question(question)
    
    def set_teams(self, teams: list[str]):
        self._teams_info = {name: Team(name) for name in teams}

    def reset_game(self):
        """Сбрасывает состояние игры"""
        self._teams_info = {}
        self._current_team_index = 0

    def get_team_list(self) -> list[str]:
        """List all teams in the game."""
        return list(self._teams_info.keys())

    def next_team(self):
        if self._current_team_index == len(self._teams_info) - 1:
            self._current_team_index = 0
        else:
            self._current_team_index += 1

    def get_current_team(self) -> str:
        """Передаёт название команды, которая должна ходить"""
        return self.get_team_list()[self._current_team_index]

    def _update_score(self, price: int, is_correct: bool):
        current_team = self._teams_info[self.get_current_team()]
        current_team.score += price if is_correct else -price

    def get_team_score(self, team_name: str) -> int:
        """Передает общий счет команды по запросу"""
        return self._teams_info[team_name].score

    def submit_answer(self, question: str, answer: str, price: int) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        is_correct = self._question_catalog._get_current_questions_data()[question].correct_answer == answer
        self._update_score(price, is_correct)
        self._question_catalog.mark_question_used(question)
        return is_correct

    def is_used(self, question: str) -> bool:
        return self._question_catalog._get_current_questions_data()[question].used


game = Game()
game.get_category_list()
