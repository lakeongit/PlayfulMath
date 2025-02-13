# Contributing to PlayfulMath

## Code Style Guide

### TypeScript/JavaScript

1. **General Rules**
   - Use TypeScript for all new code
   - Maintain strict type checking
   - Use async/await over promises
   - Implement proper error handling

2. **Naming Conventions**
   ```typescript
   // Interface names are PascalCase
   interface UserProfile {}

   // Type names are PascalCase
   type ValidationResult = {
     valid: boolean;
     errors: string[];
   };

   // Variables and functions are camelCase
   const getUserProfile = async (userId: number) => {};
   ```

3. **Component Structure**
   ```typescript
   // Components are function components with type annotations
   interface Props {
     title: string;
     onAction: () => void;
   }

   export const ExampleComponent: FC<Props> = ({ title, onAction }) => {
     return (
       <div>
         <h1>{title}</h1>
         <button onClick={onAction}>Click me</button>
       </div>
     );
   };
   ```

### CSS/Styling

1. **Tailwind Classes**
   - Follow utility-first approach
   - Use consistent spacing scale
   - Implement responsive design patterns

2. **Component Styling**
   ```typescript
   // Prefer composition of utility classes
   const className = cn(
     "px-4 py-2 rounded",
     "bg-primary text-white",
     "hover:bg-primary/90"
   );
   ```

## Git Workflow

1. **Branch Naming**
   ```
   feature/description
   bugfix/description
   hotfix/description
   ```

2. **Commit Messages**
   ```
   feat: add achievement notification system
   fix: correct math problem difficulty calculation
   docs: update API documentation
   style: format code according to style guide
   ```

3. **Pull Request Process**
   - Create feature branch
   - Write tests
   - Update documentation
   - Submit PR with description
   - Address review comments

## Testing Guidelines

1. **Unit Tests**
   ```typescript
   describe('MathProblem', () => {
     it('should calculate correct difficulty level', () => {
       const problem = new MathProblem({ grade: 3 });
       expect(problem.getDifficulty()).toBe('intermediate');
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   describe('Achievement System', () => {
     it('should award achievement on problem completion', async () => {
       const result = await completeProblems(userId, 10);
       expect(result.achievements).toContain('MATH_STAR');
     });
   });
   ```

## Documentation Requirements

1. **Code Documentation**
   ```typescript
   /**
    * Generates a math problem based on student grade and difficulty
    * @param grade - Student's grade level (3-5)
    * @param difficulty - Problem difficulty (1-10)
    * @returns Generated math problem with solution
    */
   function generateProblem(grade: number, difficulty: number): Problem {}
   ```

2. **API Documentation**
   ```typescript
   /**
    * @api {post} /api/problems/submit Submit Problem Solution
    * @apiName SubmitProblem
    * @apiGroup Problems
    * @apiParam {number} problemId Problem's unique ID
    * @apiParam {string} answer User's answer
    * @apiSuccess {boolean} correct Whether the answer was correct
    */
   ```

## Review Process

1. **Code Review Checklist**
   - [ ] Follows TypeScript best practices
   - [ ] Implements proper error handling
   - [ ] Includes necessary tests
   - [ ] Updates documentation
   - [ ] Maintains accessibility standards
   - [ ] Considers performance implications

2. **Performance Considerations**
   - Minimize re-renders
   - Optimize database queries
   - Implement proper caching
   - Consider bundle size

## Getting Help

1. **Resources**
   - Project documentation
   - Technical specifications
   - API documentation
   - Component library

2. **Communication Channels**
   - GitHub Issues
   - Development chat
   - Weekly meetings
   - Documentation updates

Remember: The goal is to maintain high code quality while making the platform more engaging for young learners!
