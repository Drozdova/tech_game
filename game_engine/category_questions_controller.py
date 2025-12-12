from pathlib import Path
from dataclasses import dataclass
import json
from typing import TypeAlias, Dict


@dataclass
class QuestionInfo:
    title: str
    price: int
    correct_answer: str
    variants: list[str]
    used: bool = False


# Type aliases
_QuestionsDict: TypeAlias = Dict[str, QuestionInfo]
_SubcategoriesData: TypeAlias = Dict[str, _QuestionsDict]


class Position:
    row: int
    column: int

    def __init__(self, row=0, column=0) -> None:
        self.row = row
        self.column = column

    def to_dict(self) -> dict[str, int]:
        return {"row": self.row, "column": self.column}


class CategoryQuestionsController:
    _questions: _QuestionsDict
    _category_name: str

    def __init__(self, category_folder: Path) -> None:
        questions = self._load_questions(category_folder)
        self._questions = {q.title: q for q in questions}
        self._category_name = category_folder.stem

    def get_questions(self) -> list[str]:
        return list(self._questions.keys())

    def _get_question(self, title: str) -> QuestionInfo:
        if title not in self._questions:
            raise Exception("Question not found")
        
        return self._questions[title]
    
    def get_variants_for_question(self, question: str) -> list[str]:
        return self._get_question(question).variants

    def get_correct_answer(self, question: str) -> str:
        return self._get_question(question).correct_answer

    def is_question_used(self, question: str) -> bool:
        return self._get_question(question).used

    def get_question_position(self, question: str) -> Position:
        price = self._get_question(question).price
        return Position(
            self._transform_price(price) // 3, self._column_from_price(price)
        )

    def get_row_count(self) -> int:
        return 3

    def get_row_name(self, row: int) -> str:
        if row == 0:
            return "easy"
        elif row == 1:
            return "medium"
        elif row == 2:
            return "hard"
        else:
            raise Exception(
                f"Invalid row index: {row}. Expected 0 (easy), 1 (medium), or 2 (hard)."
            )

    def get_prices(self) -> list[int]:
        return [q.price for q in self._questions.values()]

    def mark_question_used(self, question: str):
        self._get_question(question).used = True

    def get_category_name(self) -> str:
        return self._category_name

    def _transform_price(self, price: int) -> int:
        return int((price) / 100) - 1

    def _column_from_price(self, price: int) -> int:
        return self._transform_price(price) % 3

    def _load_from_json_file(self, path: Path) -> QuestionInfo:
        price = int(path.stem)
        with open(path, encoding="utf-8") as file:
            data = json.load(file)
            return QuestionInfo(data["title"], price, data["correct_answer"], data["variants"])

    def _get_question_files(self, folder: Path) -> list[Path]:
        return list(folder.glob("*.json"))
    
    def _read_questions(self, files: list[Path]) -> list[QuestionInfo]:
        return [self._load_from_json_file(file) for file in files]
    
    def _load_questions(self, folder: Path) -> list[QuestionInfo]:
        
        files = self._get_question_files(folder)
        
        if len(files) != 9:
            raise Exception(f"Expected exactly 9 question files, but found {len(files)}.")

        return self._read_questions(files)

class SubcategoriesQuestionController(CategoryQuestionsController):
    _subcategories_data: _SubcategoriesData

    def __init__(self, root_folder: Path) -> None:
        super().__init__(root_folder)
        

    def get_question_position(self, question: str) -> Position:
        for row, questions in enumerate(self._subcategories_data.values()):
            if question in questions:
                price = self._get_question(question).price
                column = self._column_from_price(price)
                return Position(row, column)

        raise ValueError(f"Question '{question}' not found in any subcategory.")

    def get_row_count(self) -> int:
        return len(self._subcategories_data)
    
    def get_row_name(self, row: int) -> str:
        if len(self._subcategories_data) <= row:
            raise Exception("Wrong row given")

        return list(self._subcategories_data.keys())[row]

    def _load_questions(self, folder: Path) -> list[QuestionInfo]:
        self._subcategories_data = {}

        for subfolder in folder.iterdir():
            files = self._get_question_files(subfolder)
            
            if len(files) != 3:
                raise Exception(f'Expected exactly 3 question files in folder {subfolder.stem}, but found {len(files)}.')
            
            questions = self._read_questions(files)
            self._subcategories_data[subfolder.stem] = {q.title: q for q in questions}

        all_questions = []
        for subcategory in self._subcategories_data.values():
            all_questions += subcategory.values()

        return all_questions