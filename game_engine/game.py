"""Base Game interface."""
import json

class QuestionInfo:
    title: str
    cost: int

class Game:
    """Base class for game logic. All game methods should be synchronous."""

    def list_teams(self) -> list[str]: 
        """List all teams in the game."""
        raise NotImplementedError()

    def set_current_team(self, team_name: str) -> None:  
        """Set the current team for the game."""
        raise NotImplementedError()
    
    def get_team_score(self, team_name: str) -> int:
        """Get the score for a team."""
        raise NotImplementedError()
      
    def load_questions(self):
        """Load questions from the folder."""
        self.questions_variants = []
        for i in range(100, 1000, 100):
            with open(f'C:\\Users\\eva95\\PycharmProjects\\VS_projects\\tech-game\\game_engine\\resources\\game_questions\\{i}.json', encoding="utf-8") as file:
                data = json.load(file)
                data['price'] = i
                self.questions_variants.append(data)

    def list_questions(self) -> list[str]:
        self.question_list = [x['title'] for x in self.questions_variants] 
        return self.question_list
    
    def get_variants_for_question(self, question_index: int) -> list[str]:
        """Get the variants for a question."""
        raise NotImplementedError()
    
    def submit_answer(self, question_id, answer: str) -> bool: 
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        raise NotImplementedError()

