from typing import TypeVar, List, Union
import json

T = TypeVar('T')

class Update:
    def __init__(self, value: T, diff: int):
        self.value = value
        self.diff = diff

class State:
    def __init__(self, collect_history: bool = False):
        self.state = {}
        self.timestamp = 0
        self.valid = True
        self.history = [] if collect_history else None

    def get_state(self) -> List[T]:
        result = []
        for key, value in self.state.items():
            clone = json.loads(key)
            for i in range(int(value)):
                result.append(clone)
        return result

    def get_history(self):
        return self.history

    def validate(self, timestamp: int):
        if not self.valid:
            raise Exception("Invalid state.")
        elif timestamp < self.timestamp:
            print("Invalid timestamp.")
            self.valid = False
            raise Exception(f"Update with timestamp ({timestamp}) is lower than the last timestamp ({self.timestamp}). Invalid state.")

    def process(self, update: Update):
        value = json.dumps(update['value'])
        count = self.state.get(value, 0) + update['diff']

        if count <= 0:
            del self.state[value]
        else:
            self.state[value] = count

        if self.history is not None:
            self.history.append(update)

    def update(self, updates: List[Update], timestamp: int):
        if len(updates) > 0:
            self.validate(timestamp)
            self.timestamp = timestamp
            for update in updates:
                self.process(update)
