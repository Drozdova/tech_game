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


class Game:
    """Base class for game logic. All game methods should be synchronous."""

    topic_name = "Кошечки и собачки"
    _questions_info: dict[str, QuestionInfo]

    def __init__(self) -> None:
        self._load_data()
        self.teams_scores = {}
        self.current_team_index = 0

    def list_teams(self) -> list[str]:
        """List all teams in the game."""
        self.lst_teams = input("Введите имена команд через запятую: ").split(",")
        self.teams_scores.update(dict.fromkeys(self.lst_teams, 0))
        return self.lst_teams

    def next_team(self):
        if self.current_team_index == len(self.lst_teams) - 1:
            self.current_team_index = 0
        else:
            self.current_team_index += 1

    def get_current_team(self) -> str:
        """Передаёт название команды, которая должна ходить"""
        self.current_team = self.lst_teams[self.current_team_index]
        return self.current_team

    def count_score(self, price, is_correct):
        if is_correct:
            self.teams_scores[self.current_team] += price
        else:
            self.teams_scores[self.current_team] -= price

    def get_team_score(self, team_name: str) -> int:
        """Передает общий счет команды по запросу"""
        team_score = self.teams_scores[team_name]
        return team_score

    def get_questions_list(self) -> list[str]:
        """Передает список вопросов"""
        return list(self._questions_info.keys())

    def get_prices(self) -> list[int]:
        '''Передает цены вопросов'''
        prices = [self._questions_info[x].price for x in self._questions_info]
        return prices
    
    def mark_question_used(self, question):
        self._questions_info[question].used = True

    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        return self._questions_info[question].variants

    def submit_answer(self, question, answer: str, price) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        is_correct = self._questions_info[question].correct_answer == answer
        self.count_score(price, is_correct)
        self.mark_question_used(question)
        return is_correct

    def is_used(self, question: str) -> bool:
        is_used = self._questions_info[question].used
        return is_used

    def _load_data(self):
        """Load questions from the folder."""
        self._questions_info = {}
        for i in range(100, 1000, 100):
            with open(
                f"game_engine/resources/game_questions/{self.topic_name}/{i}.json",
                encoding="utf-8",
            ) as file:
                data = json.load(file)
                self._questions_info[data["title"]] = QuestionInfo(data["title"], i, data["correct_answer"], data["variants"])