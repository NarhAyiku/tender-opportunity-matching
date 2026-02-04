

from app.services.document_parser import DocumentParser

def test_parse_social_links():
    parser = DocumentParser()
    
    # Test case 1: Text with all links
    text_full = """
    John Doe
    Software Engineer
    Email: john@example.com
    LinkedIn: linkedin.com/in/johndoe123
    GitHub: github.com/johndoe
    Portfolio: www.johndoe.dev
    """
    
    links, confidence = parser.parse_social_links(text_full)
    print(f"Extracted links: {links}")
    
    assert "linkedin.com/in/johndoe123" in links['linkedin_url']
    assert "github.com/johndoe" in links['github_url']
    assert "johndoe.dev" in links['portfolio_url']
    assert confidence['linkedin_url'] > 0.9
    
    # Test case 2: Text with no links
    text_empty = """
    John Doe
    Just a regular resume without links.
    """
    links, confidence = parser.parse_social_links(text_empty)
    assert links['linkedin_url'] == ""
    assert links['github_url'] == ""
    
    # Test case 3: Text with full https links
    text_https = """
    https://www.linkedin.com/in/jane-doe
    https://github.com/janedoe
    """
    links, confidence = parser.parse_social_links(text_https)
    assert "linkedin.com/in/jane-doe" in links['linkedin_url']
    assert "github.com/janedoe" in links['github_url']

if __name__ == "__main__":
    test_parse_social_links()
    print("All tests passed!")
