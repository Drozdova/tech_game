"""Dummy game implementation for testing."""

from .game import Game
import random
from typing import Callable, TypeVar

T = TypeVar('T')


def try_super_or(super_method: Callable[[], T], fallback: Callable[[], T]) -> T:
    """Try to call super method, if NotImplementedError - use fallback."""
    try:
        return super_method()
    except NotImplementedError:
        return fallback()


class DummyGame(Game):
    """Simple game implementation that echoes messages."""
    
    def __init__(self):
        """Initialize the game with default state."""
        self.current_team: str | None = None
    
    def list_teams(self) -> list[str]:
        return try_super_or(
            super().list_teams,
            lambda: ["Команда А", "Команда Б", "Команда В"]
        )

    def set_current_team(self, team_name: str) -> None:
        try_super_or(
            lambda: super().set_current_team(team_name),
            lambda: setattr(self, 'current_team', team_name)
        )
    
    def get_team_score(self, team_name: str) -> int:
        return try_super_or(
            lambda: super().get_team_score(team_name),
            lambda: random.randint(0, 100)
        )
    
    def list_questions(self) -> list[str]:
        return try_super_or(
            super().list_questions,
            lambda: [f'Question {i}' for i in range(9)]
        )
    
    def get_variants_for_question(self, question_index: int) -> list[str]:
        return try_super_or(
            lambda: super().get_variants_for_question(question_index),
            lambda: [f'Q{question_index}: Variant {i}' for i in range(4)]
        )
    
    def submit_answer(self, question_id, answer: str) -> bool:
        return try_super_or(
            lambda: super().submit_answer(question_id, answer),
            lambda: random.choice([True, False])
        )

