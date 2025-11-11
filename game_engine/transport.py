"""Message transport and handling utilities."""

import json
from typing import Any, Dict


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
        if msg_id is None or method is None:
            return json.dumps({
                "id": msg_id,
                "result": None,
                "error": "Invalid message format: missing id or method"
            })
        
        # Check if method exists on game
        if not hasattr(game, method):
            return json.dumps({
                "id": msg_id,
                "result": None,
                "error": f"Method not found: {method}"
            })
        
        # Call the method
        game_method = getattr(game, method)
        result = game_method(*args)
        
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

