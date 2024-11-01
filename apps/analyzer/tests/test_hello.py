"""Hello unit test module."""

from metadata_analyzer.main import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello metadata-analyzer"
