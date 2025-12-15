"""Base Game interface."""

from asyncio import streams
from pathlib import Path
from dataclasses import dataclass
from .category_questions_controller import CategoryQuestionsController, SubcategoriesQuestionController, Position


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
        self.reset_game()


    def reset_game(self):
        """Сбрасывает состояние игры"""
        self._teams = {}
        self._current_team_index = 0
        self._current_category = None
        self._category_controllers = {}
        
        self._load_categories()

    def set_teams(self, teams: list[str]):
        if len(teams) < 1:
            raise Exception("At least 1 team is expected. 0 given")
        self._teams = {name: Team(name) for name in teams}

    def get_team_list(self) -> list[str]:
        """List all teams in the game."""
        return list(self._teams.keys())

    def next_team(self):
         self._current_team_index = (self._current_team_index + 1) % len(self._teams)

    def get_current_team(self) -> str:
        """Передаёт название команды, которая должна ходить"""
        return self.get_team_list()[self._current_team_index]

    def get_team_score(self, team_name: str) -> int:
        """Передает общий счет команды по запросу"""
        return self._teams[team_name].score

    def get_category_list(self) -> list[str]:
        return list(self._category_controllers.keys())

    def is_category_used(self, category: str) -> bool:
        if category not in self._category_controllers:
            raise Exception("Category not found")
        
        return self._category_controllers[category].is_all_questions_used()

    def set_current_category(self, selected_category: str):
        if selected_category not in self._category_controllers:
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

    def get_row_count(self) -> int:
        return self._get_current_category().get_row_count()
    
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
        return self._get_current_category().is_question_used(question)

    def _update_score(self, price: int, is_correct: bool):
        current_team = self._teams[self.get_current_team()]
        current_team.score += price if is_correct else -price
    
    def _load_categories(self):
        self._category_controllers = {}
        for folder in (Path(__file__).parent / "resources" / "game_questions").iterdir():
            if any(item.is_dir() for item in folder.iterdir()):
                category = SubcategoriesQuestionController(folder)
            else:
                category = CategoryQuestionsController(folder)
            self._category_controllers[folder.stem] = category

    def _get_current_category(self) -> CategoryQuestionsController:
        if self._current_category is None:
            raise Exception("No selected category")
        return self._current_category
