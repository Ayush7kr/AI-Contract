"""
Text extraction service.
Handles PDF (pdfplumber), DOCX (python-docx), and scanned PDFs (OCR via pytesseract).
"""
import os
import io
from typing import Tuple
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    from docx import Document
except ImportError:
    Document = None


def extract_text(file_path: str, file_type: str) -> Tuple[str, int]:
    """
    Extract text from a file.
    Returns: (text, page_count)
    """
    file_type = file_type.lower().strip(".")

    if file_type == "pdf":
        if not pdfplumber:
             raise RuntimeError("PDF extraction module (pdfplumber) is not installed on the server.")
        return _extract_pdf(file_path)
    elif file_type in ("docx", "doc"):
        if not Document:
             raise RuntimeError("DOCX extraction module (python-docx) is not installed on the server.")
        return _extract_docx(file_path)
    elif file_type == "txt":
        return _extract_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _extract_pdf(file_path: str) -> Tuple[str, int]:
    """Extract text from PDF using pdfplumber; fallback to OCR for scanned pages."""
    extracted_pages = []
    page_count = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text()
                if text and text.strip():
                    extracted_pages.append(text)
                else:
                    # Fallback: OCR on the page image
                    ocr_text = _ocr_page(page)
                    if ocr_text:
                        extracted_pages.append(ocr_text)
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {str(e)}")

    return "\n\n".join(extracted_pages), page_count


def _ocr_page(page) -> str:
    """Run OCR on a pdfplumber page object."""
    try:
        img = page.to_image(resolution=200).original
        if not pytesseract:
            return ""
        return pytesseract.image_to_string(img)
    except Exception:
        return ""


def _extract_docx(file_path: str) -> Tuple[str, int]:
    """Extract text from DOCX using python-docx."""
    try:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also extract table content
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text)
        return "\n\n".join(paragraphs), 1
    except Exception as e:
        raise RuntimeError(f"DOCX extraction failed: {str(e)}")


def _extract_txt(file_path: str) -> Tuple[str, int]:
    """Extract text from plain text file."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return text, 1
    except Exception as e:
        raise RuntimeError(f"TXT extraction failed: {str(e)}")
