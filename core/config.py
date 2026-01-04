# core/config.py
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    minimax_api_key: SecretStr = SecretStr("")
    openrouter_api_key: SecretStr | None = None
    exa_api_key: SecretStr | None = None
    tavily_api_key: SecretStr | None = None
    firecrawl_api_key: SecretStr | None = None
    brave_api_key: SecretStr | None = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    def get_available_search_tools(self) -> list[str]:
        tools = []
        if self.exa_api_key:
            tools.append("exa")
        if self.tavily_api_key:
            tools.append("tavily")
        if self.firecrawl_api_key:
            tools.append("firecrawl")
        if self.brave_api_key:
            tools.append("brave")
        return tools
