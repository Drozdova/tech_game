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


class Position:
    row: int
    column: int

    def __init__(self, row=0, column=0) -> None:
        self.row = row
        self.column = column

    def to_dict(self) -> dict:
        return {"row": self.row, "column": self.column}

class CategoryQuestionsControllerBasic:
    _questions: dict[str, QuestionInfo]
    _category_folder: Path

    def __init__(self, questions_folder: Path) -> None:
        self._category_folder = questions_folder
        self._load_questions()

    def get_questions(self) -> list[str]:
        return list(self._questions.keys())

    def get_variants_for_question(self, question: str) -> list[str]:
        return self._questions[question].variants

    def get_correct_answer(self, question: str) -> str:
        return self._questions[question].correct_answer
    
    def get_question_status(self, question: str) -> bool:
        return self._questions[question].used
    
    def get_question_position(self, question: str) -> Position:
        if question not in self._questions.keys():
            raise Exception("Question is not exist")
        
        price = self._questions[question].price
        return Position((int(price/100) - 1) // 3, self._column_from_price(price))

    def get_row_name(self, row: int) -> str:
        if row == 0:
            return "easy"
        elif row == 1:
            return "medium"
        elif row == 2:
            return "hard"
        else:
            raise Exception("More than 3 column")

    def get_prices(self) -> list[int]:
        return [q.price for q in self._questions.values()]

    def mark_question_used(self, question):
        self._questions[question].used = True

    def get_category_name(self) -> str:
        return self._category_folder.stem
    
    def _column_from_price(self, price: int) -> int:
        return (int((price)/100) - 1) % 3

    def _load_questions(self):
        self._questions = {}
        
        file_path_lst = list(self._category_folder.glob("*.json"))
        if len(file_path_lst) != 9:
            raise Exception("More than 9 questions")
        
        for file_path in file_path_lst:
            question_info = self._load_from_json_file(file_path)
            self._questions[question_info.title] = question_info


    def _load_from_json_file(self, path) -> QuestionInfo:
        price = int(path.stem)
        with open(path, encoding="utf-8") as file:
            data = json.load(file)
            return QuestionInfo(
                data["title"], price, data["correct_answer"], data["variants"]
            )

class SubfoldersCategoryController(CategoryQuestionsControllerBasic):
    _subcategories_data: dict[str, dict[str, QuestionInfo]]
    
    def __init__(self, category_parent_folder: Path) -> None:
        super().__init__(category_parent_folder)

    def _load_questions(self):
        self._questions = {}
        self._subcategories_data = {}

        for folder in self._category_folder.iterdir():
            files_path_lst = list(folder.glob("*.json"))
            self._subcategories_data[folder.stem] = {}
            category_questions = self._subcategories_data[folder.stem]

            if len(files_path_lst) != 3:
                raise Exception("More than 3 questions")
            
            for file_path in files_path_lst:
                question_info = self._load_from_json_file(file_path)
                self._questions[question_info.title] = question_info
                category_questions[question_info.title] = question_info

    def get_question_position(self, question: str) -> Position:
        for i, category in enumerate(self._subcategories_data):
            if question in self._subcategories_data[category]:
                return Position(i, self._column_from_price(self._questions[question].price))
        raise Exception("Question not found")        

    def get_row_name(self, row: int) -> str:
        if len(self._subcategories_data) <= row:
            raise Exception("Wrong count of rows")

        return list(self._subcategories_data.keys())[row]