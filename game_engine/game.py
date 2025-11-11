"""Base Game interface."""


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
      
    def list_questions(self) -> list[str]: 
        raise NotImplementedError()
    
    def get_variants_for_question(self, question_index: int) -> list[str]:
        """Get the variants for a question."""
        raise NotImplementedError()
    
    def submit_answer(self, question_id, answer: str) -> bool: 
        """Submit an answer for a question. Returns True if the answer is correct, False otherwise."""
        raise NotImplementedError()
    

