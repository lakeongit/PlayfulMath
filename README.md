# PlayfulMath - Interactive Math Learning Platform

An engaging, gamified mathematics learning platform designed specifically for elementary school students (grades 3-5). PlayfulMath makes learning mathematics fun and interactive while ensuring educational effectiveness through adaptive difficulty levels and comprehensive progress tracking.

## 🌟 Features

### Core Learning Features
- **Dynamic Problem Generation**: Automatically generates age-appropriate math problems
- **Adaptive Difficulty**: Adjusts problem difficulty based on student performance
- **Multiple Problem Types**: Covers various mathematical concepts including:
  - Addition
  - Subtraction
  - Multiplication
  - Division
  - Word Problems

### Engagement & Gamification
- **Achievement System**: Rewards students for completing challenges and maintaining streaks
- **Progress Tracking**: Visual representation of learning progress
- **Skill Badges**: Recognition for mastering specific mathematical concepts
- **Daily Challenges**: Keeps students engaged with new daily objectives

### User Experience
- **Student-Friendly Interface**: Intuitive design optimized for elementary school students
- **Responsive Design**: Works seamlessly across devices
- **Interactive Learning**: Immediate feedback and explanations
- **Personalized Learning Path**: Adapts to individual student progress

## 🚀 Technical Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/playfulmath.git
cd playfulmath
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
DATABASE_URL=your_postgresql_database_url
SESSION_SECRET=your_session_secret
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
playfulmath/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route components
│   │   ├── lib/         # Utility functions
│   │   └── hooks/       # Custom React hooks
├── server/              # Backend Express application
│   ├── routes/         # API endpoints
│   ├── storage/        # Database interfaces
│   └── middleware/     # Express middleware
└── shared/             # Shared types and utilities
    └── schema.ts       # Database schema and types
```

## 🔄 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Problems
- `GET /api/problems` - Fetch math problems
- `POST /api/problems/submit` - Submit problem solution

### Achievements
- `GET /api/achievements/:userId` - Get user achievements
- `POST /api/achievements` - Award new achievement

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- TanStack Query for robust data fetching
- The open-source community for inspiration and tools

## 📬 Contact

For any questions or feedback, please open an issue in the GitHub repository.

---
Made with ❤️ for young mathematicians
