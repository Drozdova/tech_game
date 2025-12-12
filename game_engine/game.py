"""Base Game interface."""

from asyncio import streams
from pathlib import Path
from dataclasses import dataclass
from .category_question_controller import CategoryQuestionsController, SubfoldersCategoryController, Position


@dataclass
class Team:
    name: str
    score: int = 0


class Game:
    """Base class for game logic. All game methods should be synchronous."""

    _teams: dict[str, Team]
    _current_team_index: int
    _category_controllers: dict[str, CategoryQuestionsController]
    _current_category: CategoryQuestionsController | None

    def __init__(self):
        self._current_team_index = 0
        self._teams = {}
        self._category_controllers = {}
        self._current_category = None

        self._load_categories()


    def reset_game(self):
        """Сбрасывает состояние игры"""
        self._teams = {}
        self._current_team_index = 0

    def set_teams(self, teams: list[str]):
        if len(teams) < 1:
            raise Exception("At least 1 team is expected. 0 given")
        self._teams = {name: Team(name) for name in teams}

    def get_team_list(self) -> list[str]:
        """List all teams in the game."""
        return list(self._teams.keys())

    def next_team(self):
        if self._current_team_index == len(self._teams) - 1:
            self._current_team_index = 0
        else:
            self._current_team_index += 1

    def get_current_team(self) -> str:
        """Передаёт название команды, которая должна ходить"""
        return self.get_team_list()[self._current_team_index]

    def _update_score(self, price: int, is_correct: bool):
        current_team = self._teams[self.get_current_team()]
        current_team.score += price if is_correct else -price

    def get_team_score(self, team_name: str) -> int:
        """Передает общий счет команды по запросу"""
        return self._teams[team_name].score

    def get_category_list(self) -> list[str]:
        return list(self._category_controllers.keys())

    def set_current_category(self, selected_category: str):
        if selected_category not in self._category_controllers.keys():
            raise Exception("Category not found")

        self._current_category = self._category_controllers[selected_category]
        
    def get_selected_category(self) -> str | None:
        return self._current_category.get_category_name() if self._current_category else None
        
    def get_current_questions(self) -> list[str]:
        """Передает список вопросов"""
        return self._get_current_category().get_questions()

    def get_prices(self) -> list[int]:
        """Передает цены вопросов"""
        return self._get_current_category().get_prices()

    def get_questions(self) -> list[str]:
        return self._get_current_category().get_questions()
    
    def get_question_position(self, question: str) -> Position:
        return self._get_current_category().get_question_position(question)

    def get_row_name(self, row: int) -> str:
        return self._get_current_category().get_row_name(row)
    
    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        return self._get_current_category().get_variants_for_question(question)
    
    def submit_answer(self, question: str, answer: str, price: int) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        is_correct = self._get_current_category().get_correct_answer(question) == answer
        self._update_score(price, is_correct)
        self._get_current_category().mark_question_used(question)
        return is_correct

    def is_used(self, question: str) -> bool:
        return self._get_current_category().get_question_flag(question)

    def _load_categories(self):
        for folder in (Path(__file__).parent / "resources" / "game_questions").iterdir():
            if any(item.is_dir() for item in folder.iterdir()):
                category = SubfoldersCategoryController(folder)
            else:
                category = CategoryQuestionsController(folder)
            self._category_controllers[folder.stem] = category

    def _get_current_category(self) -> CategoryQuestionsController:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category