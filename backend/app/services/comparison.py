"""
Contract Comparison Service.
Compares two contract texts using difflib and generates AI summary.
"""
import difflib
from typing import List, Dict, Any


def compare_contracts(text1: str, text2: str) -> Dict[str, Any]:
    """
    Compare two contract texts.
    Returns added/removed/changed sections with diff stats.
    """
    lines1 = text1.splitlines(keepends=True)
    lines2 = text2.splitlines(keepends=True)

    differ = difflib.Differ()
    raw_diff = list(differ.compare(lines1, lines2))

    added = []
    removed = []
    unchanged_count = 0
    changed_count = 0

    for line in raw_diff:
        prefix = line[:2]
        content = line[2:].strip()
        if not content:
            continue
        if prefix == "+ ":
            added.append(content)
            changed_count += 1
        elif prefix == "- ":
            removed.append(content)
            changed_count += 1
        elif prefix == "  ":
            unchanged_count += 1

    # Generate unified diff for display
    unified = list(difflib.unified_diff(
        lines1, lines2,
        fromfile="Contract Version 1",
        tofile="Contract Version 2",
        lineterm="",
        n=2  # context lines
    ))

    # Similarity ratio
    matcher = difflib.SequenceMatcher(None, text1, text2)
    similarity = round(matcher.ratio() * 100, 1)

    return {
        "added_lines": added[:50],       # Cap for response size
        "removed_lines": removed[:50],
        "added_count": len(added),
        "removed_count": len(removed),
        "unchanged_count": unchanged_count,
        "changed_count": changed_count,
        "similarity_percent": similarity,
        "unified_diff": "\n".join(unified[:200]),  # Truncate for response
        "summary": _generate_diff_summary(added, removed, similarity),
    }


def _generate_diff_summary(added: List[str], removed: List[str], similarity: float) -> str:
    """Generate a plain-English summary of the differences."""
    if similarity > 95:
        return "The two contracts are nearly identical with minor formatting or wording changes."
    elif similarity > 75:
        return f"The contracts are substantially similar ({similarity}% match) with {len(added)} additions and {len(removed)} removals. Review the highlighted changes for material differences."
    else:
        return f"The contracts differ significantly ({similarity}% similarity). Key changes detected: {len(added)} new clauses/terms added and {len(removed)} removed. These differences may represent material renegotiations."
