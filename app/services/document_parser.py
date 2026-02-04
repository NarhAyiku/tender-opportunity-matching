"""
Document parsing service (MVP - deterministic approach).
Extracts structured data from resumes and transcripts using regex + heuristics.
Per PRD Milestone 2: "parser worker/service; confidence handling"
NO LLM integration (approved decision).
"""
import re
import PyPDF2
from docx import Document
from typing import Dict, Any, List, Tuple
from io import BytesIO


class DocumentParser:
    """
    Deterministic document parser using section detection + regex.
    Confidence scoring based on pattern matching quality.
    """
    
    # Common section headers (case-insensitive)
    SECTION_PATTERNS = {
        'skills': r'(?:technical\s+)?skills?|competencies|proficiencies',
        'experience': r'(?:work\s+)?experiences?|employment|professional\s+background',
        'education': r'educations?|academic\s+background|qualifications',
        'projects': r'projects?|portfolio',
        'awards': r'awards?|honors?|achievements',
        'certifications': r'certifications?|licenses?',
        'languages': r'languages?',
        'interests': r'interests?|hobbies',
    }
    
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF file."""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX file."""
        try:
            doc = Document(BytesIO(file_bytes))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
    
    def extract_text(self, file_bytes: bytes, mime_type: str) -> str:
        """Extract text based on file type."""
        if 'pdf' in mime_type.lower():
            return self.extract_text_from_pdf(file_bytes)
        elif 'word' in mime_type.lower() or 'docx' in mime_type.lower():
            return self.extract_text_from_docx(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {mime_type}")
    
    def detect_sections(self, text: str) -> Dict[str, str]:
        """
        Detect sections in document by finding headers.
        Returns dict of {section_name: section_content}.
        """
        sections = {}
        lines = text.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line_lower = line.strip().lower()
            
            # Check if line is a section header
            matched_section = None
            for section, pattern in self.SECTION_PATTERNS.items():
                if re.search(pattern, line_lower):
                    matched_section = section
                    break
            
            if matched_section:
                # Save previous section
                if current_section:
                    sections[current_section] = '\n'.join(current_content).strip()
                # Start new section
                current_section = matched_section
                current_content = []
            elif current_section:
                current_content.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections
    
    def parse_skills(self, text: str) -> Tuple[List[str], float]:
        """
        Extract skills from text.
        Returns: (skills_list, confidence_score)
        """
        skills = []
        confidence = 0.5  # Default low confidence
        
        # Common skill keywords/patterns
        skill_keywords = [
            'python', 'javascript', 'java', 'c\\+\\+', 'react', 'node',
            'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git',
            'machine learning', 'data analysis', 'project management'
        ]
        
        # Try to find a skills section first
        if text.strip():
            # Split by common delimiters
            potential_skills = re.split(r'[,•;|]|\n', text)
            for skill in potential_skills:
                skill = skill.strip()
                if skill and len(skill) > 2 and len(skill) < 50:
                    skills.append(skill)
                    confidence = 0.85  # Higher confidence if found in dedicated section
        
        # If no dedicated section, scan for keywords
        if not skills:
            text_lower = text.lower()
            for keyword in skill_keywords:
                if re.search(keyword, text_lower):
                    skills.append(keyword)
            confidence = 0.6 if skills else 0.3
        
        return skills[:15], min(confidence, 0.95)  # Cap at 15 skills, max 95% confidence
    
    def parse_work_experience(self, text: str) -> Tuple[List[Dict], float]:
        """
        Extract work experiences.
        Returns: (experiences_list, confidence_score)
        """
        experiences = []
        confidence = 0.5
        
        # Look for job titles (common patterns)
        title_patterns = [
            r'(?:senior|junior|lead)?\s*(?:software|data|product|project)\s+(?:engineer|developer|manager|analyst)',
            r'(?:full.?stack|backend|frontend)\s+developer',
            r'intern|internship',
        ]
        
        lines = text.split('\n')
        current_exp = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if it's a job title
            for pattern in title_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    if current_exp:
                        experiences.append(current_exp)
                    current_exp = {'title': line, 'description': ''}
                    confidence = 0.75
                    break
            else:
                # Accumulate description
                if current_exp:
                    current_exp['description'] += line + ' '
        
        if current_exp:
            experiences.append(current_exp)
        
        return experiences[:5], confidence  # Cap at 5 experiences
    
    def parse_education(self, text: str) -> Tuple[List[Dict], float]:
        """
        Extract education entries.
        Returns: (education_list, confidence_score)
        """
        education = []
        confidence = 0.6
        
        # Degree patterns
        degree_patterns = [
            r'(?:bachelor|master|phd|b\.?s\.?|m\.?s\.?|m\.?b\.?a\.?).*(?:in|of)\s+(\w+(?:\s+\w+){0,3})',
            r'(bachelor|master|phd).*degree',
        ]
        
        # Institution patterns
        institution_patterns = [
            r'university of (\w+)',
            r'(\w+\s+(?:university|college|institute))',
        ]
        
        lines = text.split('\n')
        for line in lines:
            degree_match = None
            for pattern in degree_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    degree_match = match.group(0)
                    confidence = 0.8
                    break
            
            institution_match = None
            for pattern in institution_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    institution_match = match.group(0)
                    break
            
            if degree_match or institution_match:
                education.append({
                    'degree': degree_match or 'Degree',
                    'institution': institution_match or 'Institution',
                    'field_of_study': '',
                })
        
        return education[:3], confidence  # Cap at 3 education entries
    
    def parse_projects(self, text: str) -> Tuple[List[Dict], float]:
        """Extract projects."""
        projects = []
        confidence = 0.5
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and len(line) > 10:
                projects.append({
                    'name': line,
                    'description': '',
                    'technologies': []
                })
                confidence = 0.7
        
        return projects[:5], confidence
    
        return parsed_data, confidence_scores

    def parse_social_links(self, text: str) -> Tuple[Dict[str, str], Dict[str, float]]:
        """
        Extract social links (LinkedIn, GitHub, Portfolio).
        Returns: (links_dict, confidence_dict)
        """
        links = {}
        confidence = {}
        
        # Regex patterns
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        github_pattern = r'github\.com/[\w-]+'
        # Generic URL pattern (simplified)
        url_pattern = r'(?:https?://)?(?:www\.)?[\w-]+\.(?:com|io|me|dev|net|org)(?:/[\w-]+)*'
        
        text_lower = text.lower()
        
        # 0. Strip email addresses to avoid matching their domains as portfolio URLs
        # Simple email regex
        email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
        text_without_emails = re.sub(email_pattern, '', text)
        
        # 1. LinkedIn
        match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith('http'): url = 'https://' + url
            links['linkedin_url'] = url
            confidence['linkedin_url'] = 0.95
        else:
            links['linkedin_url'] = ''
            confidence['linkedin_url'] = 0.0
            
        # 2. GitHub
        match = re.search(github_pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith('http'): url = 'https://' + url
            links['github_url'] = url
            confidence['github_url'] = 0.95
        else:
            links['github_url'] = ''
            confidence['github_url'] = 0.0
            
        # 3. Portfolio
        all_urls = re.findall(url_pattern, text_without_emails, re.IGNORECASE)
        portfolio_url = ""
        
        for url in all_urls:
            u_lower = url.lower()
            if "linkedin.com" in u_lower or "github.com" in u_lower:
                continue
            if "google.com" in u_lower or "facebook.com" in u_lower or "twitter.com" in u_lower:
                continue
            if "@" in u_lower: # skip emails
                continue
            
            # Found a candidate
            portfolio_url = url
            if not portfolio_url.startswith('http'): portfolio_url = 'https://' + portfolio_url
            break
            
        if portfolio_url:
            links['portfolio_url'] = portfolio_url
            confidence['portfolio_url'] = 0.6 # Lower confidence for generic URL
        else:
            links['portfolio_url'] = ''
            confidence['portfolio_url'] = 0.0
                
        return links, confidence

    def parse_resume(self, text: str) -> Tuple[Dict[str, Any], Dict[str, float]]:
        """
        Main resume parsing function.
        Returns: (parsed_data_dict, confidence_scores_dict)
        """
        sections = self.detect_sections(text)
        parsed_data = {}
        confidence_scores = {}
        
        # Parse each section
        if 'skills' in sections:
            parsed_data['skills'], confidence_scores['skills'] = self.parse_skills(sections['skills'])
        else:
            # Try to extract from full text
            parsed_data['skills'], confidence_scores['skills'] = self.parse_skills(text)
        
        if 'experience' in sections:
            parsed_data['work_experiences'], confidence_scores['work_experiences'] = \
                self.parse_work_experience(sections['experience'])
        else:
            parsed_data['work_experiences'], confidence_scores['work_experiences'] = ([], 0.3)
        
        if 'education' in sections:
            parsed_data['education'], confidence_scores['education'] = \
                self.parse_education(sections['education'])
        else:
            parsed_data['education'], confidence_scores['education'] = ([], 0.3)
        
        if 'projects' in sections:
            parsed_data['projects'], confidence_scores['projects'] = \
                self.parse_projects(sections['projects'])
        else:
            parsed_data['projects'] = []
            confidence_scores['projects'] = 0.3
            
        # Extract Social Links
        social_links, social_confidence = self.parse_social_links(text)
        parsed_data.update(social_links)
        confidence_scores.update(social_confidence)
        
        # Additional fields (simpler extraction)
        parsed_data['languages'] = []
        confidence_scores['languages'] = 0.3
        
        parsed_data['certifications'] = []
        confidence_scores['certifications'] = 0.3
        
        parsed_data['awards'] = []
        confidence_scores['awards'] = 0.3
        
        return parsed_data, confidence_scores
    
    def parse_transcript(self, text: str) -> Tuple[Dict[str, Any], Dict[str, float]]:
        """
        Parse academic transcript.
        Returns: (parsed_data_dict, confidence_scores_dict)
        """
        # MVP: Simple GPA extraction
        gpa_match = re.search(r'gpa[:\s]*([\d.]+)', text, re.IGNORECASE)
        
        parsed_data = {
            'gpa': gpa_match.group(1) if gpa_match else None,
            'courses': [],
            'degree_info': {}
        }
        
        confidence_scores = {
            'gpa': 0.8 if gpa_match else 0.2,
            'courses': 0.3,
            'degree_info': 0.3
        }
        
        return parsed_data, confidence_scores
