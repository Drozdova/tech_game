import json
import unittest

from game_engine.transport import handle_game_message


class FakeGame:
    def get_team_list(self):
        return ["Alpha", "Beta"]

    def _save_game_state(self):
        raise AssertionError("private method must not be called")


class TransportTests(unittest.TestCase):
    def setUp(self):
        self.game = FakeGame()

    def send(self, payload):
        return json.loads(handle_game_message(json.dumps(payload), self.game))

    def test_calls_allowed_method(self):
        response = self.send({"id": 1, "method": "get_team_list", "args": []})

        self.assertEqual(response["result"], ["Alpha", "Beta"])
        self.assertIsNone(response["error"])

    def test_rejects_private_method(self):
        response = self.send({"id": 2, "method": "_save_game_state", "args": []})

        self.assertIsNone(response["result"])
        self.assertEqual(response["error"], "Method not found: _save_game_state")

    def test_rejects_non_list_arguments(self):
        response = self.send({"id": 3, "method": "get_team_list", "args": {}})

        self.assertEqual(response["error"], "Invalid message format")


if __name__ == "__main__":
    unittest.main()
