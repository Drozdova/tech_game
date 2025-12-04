"""Base Game interface."""

from pathlib import Path
from typing import Any
from dataclasses import dataclass, field
import json


@dataclass
class QuestionInfo:
    title: str
    price: int
    correct_answer: str
    variants: list[str]
    used: bool = False


@dataclass
class Team:
    name: str
    score: int = 0


class Game:
    """Base class for game logic. All game methods should be synchronous."""

    topic_name = "Кошечки и собачки"
    _questions_info: dict[str, QuestionInfo]
    _teams_info: dict[str, Team]

    def __init__(self):
        self._load_data()
        self._current_team_index = 0
        self._teams_info = {}

    def set_teams(self, teams: list[str]):
        self._teams_info = {name: Team(name) for name in teams}

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

    def get_questions_list(self) -> list[str]:
        """Передает список вопросов"""
        return list(self._questions_info.keys())

    def get_prices(self) -> list[int]:
        """Передает цены вопросов"""
        return [self._questions_info[x].price for x in self._questions_info]

    def _mark_question_used(self, question):
        self._questions_info[question].used = True

    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        return self._questions_info[question].variants

    def submit_answer(self, question: str, answer: str, price: int) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        is_correct = self._questions_info[question].correct_answer == answer
        self._update_score(price, is_correct)
        self._mark_question_used(question)
        return is_correct

    def is_used(self, question: str) -> bool:
        return self._questions_info[question].used

    def _load_data(self):
        """Load questions from the folder."""
        self._questions_info = {}
        for i in range(100, 1000, 100):
            file_name = (
                f"game_engine/resources/game_questions/{self.topic_name}/{i}.json"
            )
            with open(
                file_name,
                encoding="utf-8",
            ) as file:
                data = json.load(file)
                self._questions_info[data["title"]] = QuestionInfo(
                    data["title"], i, data["correct_answer"], data["variants"]
                )
