"""Main unit test module."""

from metadata_analyzer.main import hello_world


def test_hello_world():
    """Test the hello_world function."""
    assert hello_world() == "Hello, world!"
