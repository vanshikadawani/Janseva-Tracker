# Contributing to Janseva Tracker

Thank you for your interest in contributing! Here's how to get started.

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/janseva-tracker.git
cd janseva-tracker
```

### 2. Setup Development Environment
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh
./setup.sh
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## 📝 Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns

### File Organization
```
src/
├── models/          # Database schemas
├── routes/          # API endpoints
├── services/        # Business logic & AI
└── config/          # Configuration files

views/
├── pages/           # Page templates
└── includes/        # Reusable components

public/
├── css/             # Stylesheets
└── js/              # Client-side scripts
```

### Naming Conventions
- **Files**: `kebab-case` (e.g., `complaint.routes.js`)
- **Functions**: `camelCase` (e.g., `getComplaints()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Classes**: `PascalCase` (e.g., `ComplaintModel`)

## 🧪 Testing

### Before Submitting
1. Test your changes locally
2. Verify no console errors
3. Test with different data inputs
4. Check responsive design (mobile/tablet/desktop)

### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] No broken links
- [ ] Responsive on mobile
- [ ] Database operations work
- [ ] File uploads work (if applicable)

## 📋 Commit Guidelines

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Build/dependency updates

### Examples
```
feat(complaints): add duplicate detection
fix(auth): resolve login redirect issue
docs(readme): update setup instructions
refactor(ai): optimize model loading
```

## 🔄 Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Clear title and description
   - Reference related issues
   - Include screenshots if UI changes
   - List any breaking changes

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Screenshots (if applicable)
   Add screenshots here

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows/macOS/Linux
- Node version: 
- npm version:

## Screenshots
If applicable
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives
Other approaches considered
```

## 📚 Documentation

### When to Update Docs
- New features
- API changes
- Configuration changes
- Bug fixes affecting users

### Documentation Files
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick setup guide
- `CONTRIBUTING.md` - This file
- Code comments - Inline documentation

## 🔐 Security

### Security Guidelines
- Never commit `.env` files
- Don't hardcode secrets
- Validate all user inputs
- Use parameterized queries
- Keep dependencies updated
- Report security issues privately

### Reporting Security Issues
Email: security@janseva-tracker.dev (or create private security advisory)

## 📦 Dependencies

### Adding Dependencies
```bash
npm install package-name
```

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Removing Dependencies
```bash
npm uninstall package-name
```

## 🚀 Performance Tips

- Minimize database queries
- Use indexes for frequently queried fields
- Cache AI model predictions
- Optimize image uploads
- Lazy load components

## 📞 Getting Help

- **Issues**: Check existing issues first
- **Discussions**: Use GitHub Discussions
- **Email**: contact@janseva-tracker.dev
- **Documentation**: See README.md

## 📄 License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to Janseva Tracker! 🎉
