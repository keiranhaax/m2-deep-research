# tests/py/test_config.py
import os
from core.config import Config

def test_config_loads_from_env():
    os.environ["MINIMAX_API_KEY"] = "test_key"
    config = Config()
    assert config.minimax_api_key.get_secret_value() == "test_key"
