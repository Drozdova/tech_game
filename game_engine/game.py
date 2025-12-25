"""Base Game interface."""

from asyncio import streams
from pathlib import Path
from dataclasses import dataclass
from .category_questions_controller import CategoryQuestionsController, SubcategoriesQuestionController, Position
import json


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
    _save_file: Path

    def __init__(self, save_file: Path | None = None):
        if save_file is None:
            save_file = Path(__file__).parent / "game_state.json"
        self._save_file = save_file
        self.reset_game()
        self._load_game_state()

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
        self._save_game_state()

    def get_team_list(self) -> list[str]:
        """List all teams in the game."""
        return list(self._teams.keys())

    def next_team(self):
        self._current_team_index = (self._current_team_index + 1) % len(self._teams)
        self._save_game_state()

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
        self._save_game_state()
        
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
    
    def set_current_question(self, question: str):
        self._get_current_category().set_current_question(question)
        self._save_game_state()
   
    def get_current_question(self) -> str | None:
        return self._get_current_category().get_current_question()
    
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
        self._get_current_category().clear_current_question()
        self._current_category = None
        self._save_game_state()
        return is_correct

    def is_used(self, question: str) -> bool:
        return self._get_current_category().is_question_used(question)

    def is_game_finished(self) -> bool:
        return all([self._category_controllers[category].is_all_questions_used() for category in self.get_category_list()])
    
    def finish_game(self):
        """Явно завершает игру и сохраняет состояние"""
        self._save_game_state()
        return True
    
    def _save_game_state(self):
        """Сохраняет состояние игры в JSON файл"""
        if not self._teams:
            return
        
        try:
            state = {
                "teams": {name: team.score for name, team in self._teams.items()},
                "current_team_index": self._current_team_index,
                "current_category": self._current_category.get_category_name() if self._current_category else None,
                "used_questions": {}
            }
            
            for category_name, controller in self._category_controllers.items():
                used_questions = [
                    question for question, q_info in controller._questions.items()
                    if q_info.used
                ]
                if used_questions:
                    state["used_questions"][category_name] = used_questions
            
            with open(self._save_file, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving game state: {e}")

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

    def _load_game_state(self):
        """Загружает состояние игры из JSON файла"""
        if not self._save_file.exists():
            return  # Нет сохраненного состояния
        
        try:
            with open(self._save_file, 'r', encoding='utf-8') as f:
                state = json.load(f)
            
            if "teams" in state and state["teams"]:
                self._teams = {
                    name: Team(name, score=score)
                    for name, score in state["teams"].items()
                }
                self._current_team_index = state.get("current_team_index", 0)
                
                # Ограничиваем индекс, если команд стало меньше
                if self._current_team_index >= len(self._teams):
                    self._current_team_index = 0
            
            if "used_questions" in state:
                for category_name, used_questions_list in state["used_questions"].items():
                    if category_name in self._category_controllers:
                        controller = self._category_controllers[category_name]
                        for question_title in used_questions_list:
                            if question_title in controller._questions:
                                controller._questions[question_title].used = True
            
            if "current_category" in state and state["current_category"]:
                category_name = state["current_category"]
                if category_name in self._category_controllers:
                    self._current_category = self._category_controllers[category_name]
                    
        except Exception as e:
            print(f"Error loading game state: {e}")

    def clear_saved_state(self):
        """Удаляет сохраненное состояние игры"""
        if self._save_file.exists():
            self._save_file.unlink()