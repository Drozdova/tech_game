from pathlib import Path
from dataclasses import dataclass
import json


@dataclass
class QuestionInfo:
    title: str
    price: int
    correct_answer: str
    variants: list[str]
    used: bool = False


class QuestionCatalog:
    _categories_folder: Path
    _question_catalog: dict[str, dict[str, QuestionInfo]]
    _selected_category: str | None

    def __init__(self):
        self._categories_folder = (
            Path(__file__).parent / "resources" / "game_questions"
        )
        self._selected_category = None
        self._question_catalog = {}

        self._load_data()

    def get_category_list(self) -> list[str]:
        """Передает список категорий"""
        return list(self._question_catalog.keys())

    def set_current_category(self, selected_category: str):
        """Задает вопросы по выбранной категории"""
        self._selected_category = selected_category

    def get_selected_category(self) -> str | None:
        """Возвращает выбранную категорию или None если не выбрана"""
        return self._selected_category

    def get_current_questions(self) -> list[str]:
        """Передает список вопросов"""
        return list(self._get_current_questions_data().keys())

    def get_prices(self) -> list[int]:
        """Передает цены вопросов"""
        return [q.price for q in self._get_current_questions_data().values()]

    def get_variants_for_question(self, question: str) -> list[str]:
        """Get the variants for a question."""
        return self._get_current_questions_data()[question].variants
    
    def mark_question_used(self, question):
        """Отмечает вопрос отвеченным"""
        self._get_current_questions_data()[question].used = True

    def _get_current_questions_data(self) -> dict[str, QuestionInfo]:
        if self._selected_category is None:
            raise Exception("Category not selected")

        return self._question_catalog[self._selected_category]

    def _load_data(self):
        """Load questions from the folder."""
        categories = [
            item.name for item in self._categories_folder.iterdir() if item.is_dir()
        ]

        for category in categories:

            questions = {}

            for i in range(100, 1000, 100):
                file_name = self._categories_folder / f"{category}/{i}.json"
                with open(
                    file_name,
                    encoding="utf-8",
                ) as file:
                    data = json.load(file)

                    question_info = QuestionInfo(
                        data["title"], i, data["correct_answer"], data["variants"]
                    )
                    questions[question_info.title] = question_info

            self._question_catalog[category] = questions
