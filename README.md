
# 🎯 AIBoards - Crypto Bounty Platform

A comprehensive web application for cryptocurrency bounty management built with Next.js, featuring crypto wallet authentication and alpha token rewards.

## 🌟 Features

### 🔐 Authentication
- **Crypto Wallet Authentication**: Users sign up/login using their crypto wallet address (hotkey) + password
- **Secure Session Management**: NextAuth.js integration with custom crypto address provider
- **Test Account**: `admin_hunter` / `johndoe123` (for testing purposes)

### 🎯 Bounty Management  
- **Create Bounties**: Users can create bounties with alpha cryptocurrency rewards
- **Flexible Rewards**: Choose between 60% upfront or 100% distributed over time
- **Multiple Winners**: Support for multiple winning spots per bounty
- **Categories**: Organize bounties by categories (Web Development, Smart Contracts, etc.)
- **Status Tracking**: Active, Completed, Paused, Cancelled states

### 📝 Submission System
- **File Uploads**: Drag & drop file uploads with no size limitations
- **Validation System**: Automated and manual validation for submissions
- **Community Voting**: Upvote/downvote system for submissions
- **Leaderboards**: Ranked submission displays based on scores and votes

### 📊 User Dashboard
- **Personal Analytics**: Track created bounties and submissions
- **Activity Feed**: Recent activity on user's bounties
- **Portfolio Management**: View submission status and earnings

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Beautiful Animations**: Framer Motion animations and transitions
- **Modern Components**: Shadcn/UI component library
- **Dark/Light Theme**: Built-in theme switching support

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Authentication**: NextAuth.js v4 with custom credentials provider
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/UI + Radix UI primitives
- **Animations**: Framer Motion
- **File Upload**: React Dropzone with custom validation
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

1. **Navigate to the app directory:**
   ```bash
   cd /home/ubuntu/bounty_hunter/app
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment Setup:**
   The environment variables are already configured in `.env`

4. **Database Setup:**
   ```bash
   # Generate Prisma client
   yarn prisma generate
   
   # Push schema to database
   yarn prisma db push
   
   # Seed with sample data
   yarn prisma db seed
   ```

5. **Start Development Server:**
   ```bash
   yarn dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
app/
├── api/                    # Backend API routes
│   ├── auth/              # Authentication endpoints
│   ├── bounties/          # Bounty management
│   ├── submissions/       # Submission handling
│   ├── upload/            # File upload
│   └── dashboard/         # User dashboard data
├── app/                   # Next.js app directory
│   ├── page.tsx          # Homepage
│   ├── auth/             # Authentication pages
│   ├── bounties/         # Bounty listing & details
│   ├── dashboard/        # User dashboard
│   └── create/           # Bounty creation
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── bounty-card.tsx  # Bounty display card
│   ├── navigation.tsx   # Main navigation
│   └── file-upload.tsx  # File upload component
├── lib/                 # Utilities and configurations
│   ├── auth.ts         # NextAuth configuration
│   ├── db.ts           # Prisma database client
│   └── utils.ts        # Utility functions
├── prisma/             # Database schema and migrations
└── scripts/            # Database seeding scripts
```

## 🎮 Usage

### For Bounty Hunters
1. **Sign Up**: Create account with crypto wallet address
2. **Browse Bounties**: Explore available bounties by category/status
3. **Submit Solutions**: Upload files and provide detailed submissions
4. **Vote & Engage**: Participate in community voting
5. **Track Progress**: Monitor submissions in dashboard

### For Bounty Creators
1. **Create Bounties**: Define requirements and alpha rewards
2. **Manage Submissions**: Review and validate submissions
3. **Track Activity**: Monitor submission activity and engagement
4. **Award Winners**: Select winning submissions for rewards

## 🔧 API Routes

The application includes comprehensive API routes:
- Authentication (`/api/auth/`, `/api/signup`)
- Bounty Management (`/api/bounties/`)
- Submissions (`/api/submissions/`, `/api/bounties/[id]/submissions`)
- File Handling (`/api/upload`, `/api/files/`)
- User Dashboard (`/api/dashboard`)

See `API_DOCUMENTATION.md` for detailed endpoint specifications.

## 🗄️ Database Schema

Key database models:
- **User**: Crypto wallet authentication and profiles
- **Bounty**: Bounty definitions with reward structures  
- **Submission**: User submissions with validation
- **SubmissionFile**: File upload management
- **Vote**: Community voting system
- **ValidationLog**: Submission validation tracking

## 🎨 Design System

The application uses a custom design system built on:
- **Colors**: Primary blue theme with semantic color tokens
- **Typography**: Inter font with hierarchical scale
- **Components**: Consistent spacing, shadows, and interactions
- **Animations**: Smooth transitions and micro-interactions

## 🔒 Security Features

- **Crypto Wallet Authentication**: Secure wallet-based identity
- **Session Management**: JWT-based sessions with NextAuth
- **File Upload Security**: Path validation and type checking
- **Input Validation**: Comprehensive validation on all inputs
- **CSRF Protection**: Built-in NextAuth CSRF protection

## 🧪 Testing

Test credentials for development:
- **Username**: admin_hunter
- **Wallet**: 4B8C9D2F3A1E7F9B8C5D4A2E8F1C3B7D9E2A5C8F1B4D7A3C6E9F2B5A8D1C4E7
- **Password**: johndoe123

## 📋 Future Enhancements

- Real cryptocurrency integration
- Smart contract deployment for automated payments
- Advanced validation algorithms
- Real-time notifications
- Mobile application
- Enhanced analytics and reporting

## 🤝 Contributing

This is a comprehensive bounty platform ready for deployment. The codebase follows modern React/Next.js best practices with TypeScript for type safety.

## 📄 License

This project is available for use and modification as needed.

---

**AIBoards** - *Hunt Bounties, Earn Alpha* 🎯
