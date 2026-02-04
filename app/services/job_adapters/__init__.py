"""
Job Adapters Package - Registry of all available job source adapters

Usage:
    from app.services.job_adapters import get_adapter, AVAILABLE_SOURCES
    
    adapter = get_adapter("jooble")
    jobs = await adapter.fetch_jobs("software engineer", "remote")
"""
from typing import Dict, Type, List

from app.services.job_adapters.base import BaseJobAdapter
from app.services.job_adapters.jooble import JoobleAdapter
from app.services.job_adapters.adzuna import AdzunaAdapter


# Registry of all available adapters
ADAPTERS: Dict[str, Type[BaseJobAdapter]] = {
    "jooble": JoobleAdapter,
    "adzuna": AdzunaAdapter,
}

# List of available source names
AVAILABLE_SOURCES: List[str] = list(ADAPTERS.keys())


def get_adapter(source: str, **kwargs) -> BaseJobAdapter:
    """
    Get an initialized adapter instance for the given source.
    
    Args:
        source: Name of the job source (e.g., "jooble", "adzuna")
        **kwargs: Additional arguments to pass to the adapter constructor
        
    Returns:
        Initialized adapter instance
        
    Raises:
        ValueError: If the source is not supported
        
    Example:
        adapter = get_adapter("adzuna", country="gb")
        jobs = await adapter.fetch_jobs("python developer", "London")
    """
    if source not in ADAPTERS:
        raise ValueError(
            f"Unknown source: '{source}'. "
            f"Available sources: {AVAILABLE_SOURCES}"
        )
    
    adapter_class = ADAPTERS[source]
    return adapter_class(**kwargs)


def register_adapter(source: str, adapter_class: Type[BaseJobAdapter]) -> None:
    """
    Register a new adapter at runtime.
    
    Useful for adding custom adapters without modifying this file.
    
    Args:
        source: Name for the new source
        adapter_class: Class that inherits from BaseJobAdapter
    """
    if not issubclass(adapter_class, BaseJobAdapter):
        raise TypeError(
            f"Adapter must inherit from BaseJobAdapter, got {type(adapter_class)}"
        )
    
    ADAPTERS[source] = adapter_class
    AVAILABLE_SOURCES.append(source)


__all__ = [
    "BaseJobAdapter",
    "JoobleAdapter", 
    "AdzunaAdapter",
    "get_adapter",
    "register_adapter",
    "ADAPTERS",
    "AVAILABLE_SOURCES",
]
