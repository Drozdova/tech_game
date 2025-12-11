"""Base Game interface."""

from asyncio import streams
from pathlib import Path
from dataclasses import dataclass
from .category_controller import CategoryQuestionsControllerBasic, SubfoldersCategoryController, Position


@dataclass
class Team:
    name: str
    score: int = 0


class Game:
    """Base class for game logic. All game methods should be synchronous."""

    _teams_info: dict[str, Team]
    _current_team_index: int
    _categoryControllers: dict[str, CategoryQuestionsControllerBasic]
    _current_category: CategoryQuestionsControllerBasic | None

    def __init__(self):
        self._current_team_index = 0
        self._teams_info = {}
        self._categoryControllers = {}
        self._path_to_categories = (Path(__file__).parent / "resources" / "game_questions")
        self._current_category = None

        self._load_categories()


    def reset_game(self):
        """Сбрасывает состояние игры"""
        self._teams_info = {}
        self._current_team_index = 0

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

    def get_category_list(self) -> list[str]:
        return list(self._categoryControllers.keys())

    def set_current_category(self, selected_category: str):
        self._current_category = self._categoryControllers[selected_category]
        
    def get_selected_category(self) -> str | None:
        return self._current_category.get_category_name() if self._current_category else None
    
    def get_current_questions(self) -> list[str]:
        """Передает список вопросов"""
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_questions()

    def get_prices(self) -> list[int]:
        """Передает цены вопросов"""
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_prices()

    def get_questions(self) -> list[str]:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_questions()
    
    def get_question_position(self, question: str) -> Position:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_question_position(question)

    def get_row_name(self, row: int) -> str:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_row_name(row)
    
    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_variants_for_question(question)
    
    def submit_answer(self, question: str, answer: str, price: int) -> bool:
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        if self._current_category is None:
            raise Exception("No selected category")
        
        is_correct = self._current_category.get_correct_answer(question) == answer
        self._update_score(price, is_correct)
        self._current_category.mark_question_used(question)
        return is_correct

    def is_used(self, question: str) -> bool:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category.get_question_status(question)

    def _load_categories(self):
        _category_folders = list(self._path_to_categories.iterdir())
        for folder in _category_folders:
            if any(item.is_dir() for item in folder.iterdir()):
                category = SubfoldersCategoryController(folder)
            else:
                category = CategoryQuestionsControllerBasic(folder)
            self._categoryControllers[folder.stem] = category