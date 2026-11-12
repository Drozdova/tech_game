"""Message transport and handling utilities."""

import json
from typing import Any


ALLOWED_METHODS = frozenset({
    "clear_saved_state",
    "finish_game",
    "get_category_list",
    "get_current_questions",
    "get_current_team",
    "get_prices",
    "get_question_position",
    "get_row_count",
    "get_row_name",
    "get_team_list",
    "get_team_score",
    "get_variants_for_question",
    "is_category_used",
    "is_game_finished",
    "is_used",
    "next_team",
    "reset_game",
    "set_current_category",
    "set_current_question",
    "set_teams",
    "submit_answer",
})


def handle_game_message(message: str, game: Any) -> str:
    """Handle incoming JSON-RPC style message and call game method.
    
    Args:
        message: JSON string with format {id, method, args}
        game: Game instance to call methods on
        
    Returns:
        JSON string with format {id, result, error}
    """
    try:
        # Parse incoming message
        data = json.loads(message)
        msg_id = data.get("id")
        method = data.get("method")
        args = data.get("args", [])
        
        # Validate message format
        if msg_id is None or not isinstance(method, str) or not isinstance(args, list):
            return json.dumps({
                "id": msg_id,
                "result": None,
                "error": "Invalid message format"
            })
        
        # Expose only the operations used by the browser client. This prevents
        # arbitrary access to internal and persistence methods through RPC.
        if method not in ALLOWED_METHODS:
            return json.dumps({
                "id": msg_id,
                "result": None,
                "error": f"Method not found: {method}"
            })
        
        # Call the method
        game_method = getattr(game, method)
        result = game_method(*args)

        # Convert to dict if object has to_dict method
        if hasattr(result, 'to_dict') and callable(result.to_dict):
            result = result.to_dict()
                
        # Return success response
        return json.dumps({
            "id": msg_id,
            "result": result,
            "error": None
        })
        
    except json.JSONDecodeError as e:
        return json.dumps({
            "id": None,
            "result": None,
            "error": f"Invalid JSON: {str(e)}"
        })
    except Exception as e:
        return json.dumps({
            "id": data.get("id") if 'data' in locals() else None,
            "result": None,
            "error": f"Error: {str(e)}"
        })

