# Specifications Directory

This directory contains feature specifications organized by feature folders. Each feature has its own complete documentation set.

## Structure

```
specs/
├── README.md                    # This file
└── [feature-name]/              # One folder per feature
    ├── README.md                # Feature overview and navigation
    ├── spec.md                  # Complete feature specification
    ├── requirements.md          # Detailed requirements
    └── checklists/              # Implementation checklists
        └── development.md       # Development checklist
```

## Current Features

### 🎯 [Microblog CMS](./microblog-cms/)
**Status**: 🟡 Ready for Development  
**Priority**: P1 (MVP)  
**Description**: Static Markdown blog system with Next.js, TypeScript, and TailwindCSS

**Key Features**:
- Home timeline with post cards
- Post pages with Markdown rendering
- Tag filtering system
- Mobile-first responsive design
- SEO optimization

**Quick Links**:
- [Specification](./microblog-cms/spec.md)
- [Requirements](./microblog-cms/requirements.md)
- [Development Checklist](./microblog-cms/checklists/development.md)

---

## How to Add a New Feature

### 1. Create Feature Folder
```bash
mkdir -p specs/[feature-name]/checklists
```

### 2. Create Required Documents

Use templates from `.specify/templates/`:

**spec.md** - Complete specification following Speckit format:
- User stories with priorities
- Acceptance scenarios (Given-When-Then)
- Edge cases
- Functional & non-functional requirements
- Success criteria

**requirements.md** - Quick reference for implementation:
- All functional requirements (FR-XXX)
- All non-functional requirements (NFR-XXX)
- Technical stack
- Validation rules
- Testing requirements

**checklists/development.md** - Step-by-step tasks:
- Phase-by-phase breakdown
- Checkboxes for tracking
- Quality gates
- Testing steps

**README.md** - Feature navigation:
- Overview
- Document guide
- Quick links
- Status tracking

### 3. Update This Index
Add the new feature to the "Current Features" section above.

---

## Document Templates

Templates are available in `.specify/templates/`:
- `spec-template.md` - Feature specification template
- `checklist-template.md` - Checklist template
- `plan-template.md` - Planning template
- `tasks-template.md` - Task breakdown template

---

## Best Practices

### For Specifications
✅ **DO**:
- Use clear, measurable acceptance criteria
- Prioritize user stories (P1, P2, P3)
- Include edge cases and error handling
- Make requirements testable
- Use Given-When-Then format for scenarios

❌ **DON'T**:
- Mix multiple features in one spec
- Skip priority assignments
- Use vague requirements ("should be fast")
- Forget about edge cases
- Omit success criteria

### For Requirements
✅ **DO**:
- Number all requirements (FR-001, NFR-001)
- Make requirements specific and measurable
- Separate functional from non-functional
- Include validation rules
- Document technical constraints

❌ **DON'T**:
- Duplicate content from spec unnecessarily
- Use implementation-specific language
- Skip non-functional requirements
- Forget about accessibility

### For Checklists
✅ **DO**:
- Break work into small, actionable tasks
- Group tasks by logical phases
- Include setup and deployment steps
- Add quality gates between phases
- Keep checkboxes updated

❌ **DON'T**:
- Create overly large tasks
- Skip testing steps
- Forget about documentation tasks
- Mix different concerns in one task

---

## Workflow

### Planning Phase
1. Create feature folder and documents
2. Write specification with user stories
3. Define all requirements
4. Create development checklist
5. Review with team

### Development Phase
1. Follow checklist step by step
2. Check off completed tasks
3. Reference requirements during implementation
4. Validate against acceptance criteria
5. Run quality gates before moving phases

### Testing Phase
1. Use acceptance scenarios as test cases
2. Test all edge cases
3. Verify success criteria
4. Update checklist status

### Completion Phase
1. Ensure all checklist items checked
2. Update feature status in README
3. Document any deviations from spec
4. Archive or move to completed features

---

## Status Indicators

- 🔴 **Blocked** - Cannot proceed due to dependencies
- 🟡 **Ready for Development** - Spec complete, can start
- 🟢 **In Progress** - Active development
- 🔵 **In Review** - Development complete, under review
- ⚪ **Completed** - Fully implemented and deployed
- ⚫ **Deprecated** - No longer relevant

---

## Related Documentation

- [Constitution](../.specify/memory/constitution.md) - Project principles
- [Templates](../.specify/templates/) - Document templates
- [Main README](../README.md) - Project overview

---

**Last Updated**: 2025-12-03  
**Total Features**: 1  
**Active Features**: 1 (Microblog CMS)
