import os

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# File upload settings
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Allowed file extensions
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_TRANSCRIPT_EXTENSIONS = {".pdf"}
ALLOWED_COVER_LETTER_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Upload subdirectories
RESUME_DIR = os.path.join(UPLOAD_DIR, "resumes")
TRANSCRIPT_DIR = os.path.join(UPLOAD_DIR, "transcripts")
COVER_LETTER_DIR = os.path.join(UPLOAD_DIR, "cover_letters")
PROFILE_PICTURE_DIR = os.path.join(UPLOAD_DIR, "profile_pictures")


def ensure_upload_dirs():
    """Create upload directories if they don't exist."""
    for directory in [UPLOAD_DIR, RESUME_DIR, TRANSCRIPT_DIR, COVER_LETTER_DIR, PROFILE_PICTURE_DIR]:
        os.makedirs(directory, exist_ok=True)


# Create directories on module import
ensure_upload_dirs()
