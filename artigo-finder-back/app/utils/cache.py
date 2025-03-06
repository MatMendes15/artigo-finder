from collections import OrderedDict
from typing import Any, Dict, Optional

#Implementação de cache com política LRU (Least Recently Used)~

class Cache:

    def __init__(self, max_size: int = 100):
        self.max_size = max_size
        self.cache: OrderedDict = OrderedDict()

    def __getitem__(self, key: str) -> Any:
        # Mover item para o final (mais recentemente usado)
        value = self.cache.pop(key)
        self.cache[key] = value
        return value

    def __setitem__(self, key: str, value: Any) -> None:
        # Se a chave já existe, remover primeiro
        if key in self.cache:
            self.cache.pop(key)
        # assim que atingido o limite, remover o item menos usado
        elif len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        # Adicionar novo item
        self.cache[key] = value

    def __contains__(self, key: str) -> bool:
        return key in self.cache