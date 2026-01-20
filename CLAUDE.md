# Claude Code Guidelines for Codexing Project

## Project Overview

**Project Name**: Codexing  
**Stack**: Tauri + React + TypeScript  
**Purpose**: Desktop application for memo/document creation with block-based multi-editor support

## Work Guidelines

### 1. Commenting Rules

- **No Automatic Comments**: Do not add comments for obvious or self-explanatory code
- **Comment Only When Needed**: Only add comments for complex logic, business rules, or tricky sections
- **Keep Existing Comments Updated**: Preserve current comments, and update them if related code changes

### 2. Post-Task Report

After completing **code-related tasks** (bug fixes, feature implementation, refactoring, etc.), **generate a report in Korean** using the `/claude-report` skill.

**When to generate a report:**
- Bug fixes
- New feature implementation
- Code refactoring
- Configuration changes

**When NOT to generate a report:**
- Answering questions or providing explanations
- Code review without modifications
- Research or exploration tasks
- Documentation-only tasks

#### Using the Report Generator

Run after task completion:

```
/claude-report
```

The skill will:
- Prompt you for task summary, technical details, test status, and improvements
- Automatically capture git changes
- Create a timestamped directory with titled report file (YYYYMMDDHHMM/title.md)
- Save report to `.reference/claude-report/[timestamp]/[title].md`

#### Report Structure

The generated report includes:

- **작업 요약**: Brief overview of work performed
- **주요 변경사항**: List of files added/modified/deleted (auto-captured from git)
- **기술적 세부사항**: Implementation details and major decisions
- **테스트 상태**: Test results
- **향후 개선사항**: Additional enhancements needed (if any)
