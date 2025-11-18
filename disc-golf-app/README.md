# Disc Golf App - Demo UI

A fully interactive disc golf event management application built with React, TypeScript, and Tailwind CSS. This is a demo UI with mock data designed to showcase the user experience and help identify API requirements.

## Features

### Multi-Role System
The app supports 4 user roles with distinct capabilities:
- **Player**: Browse events, join groups, submit scorecards, view stats
- **Organizer**: Review scorecards, manage event groups
- **Head Organizer**: Approve rename requests, edit events, send notifications
- **Admin**: Manage users, approve event requests, full system access

### Core Functionality

#### Events Management
- Browse upcoming and completed events
- Sign up for events (individual or as a group)
- Request new event creation
- View event details and participant lists
- Filter events by status

#### Group Management
- Create and manage disc golf groups
- Find and join existing groups
- Handle join requests
- View group members and statistics
- Leave groups or remove members (owners only)

#### Scorecard System
- Create scorecards for registered events
- Enter scores hole-by-hole
- Save as draft or submit for review
- View scorecard history
- Organizer review and approval workflow

#### Statistics & Analytics
- Personal performance stats (average score, best score, etc.)
- Group statistics and comparisons
- Event-specific performance tracking
- Historical data visualization

#### Notifications
- Real-time notification system
- Activity updates for events, groups, and scorecards
- Unread notification counter
- Mark as read functionality

#### Role-Specific Features
- **Organizer Panel**: Scorecard review, event management
- **Head Organizer Panel**: Rename approvals, event editing
- **Admin Panel**: User management, event approval

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Context API** for state management
- **Mock Data** for demo purposes

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd disc-golf-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit: `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Demo Accounts

The app includes several pre-configured demo accounts. You can log in with any of these:

| Name | Email | Role | Description |
|------|-------|------|-------------|
| John Player | john.player@example.com | Player | Basic player account |
| Sarah Organizer | sarah.organizer@example.com | Organizer | Can review scorecards |
| Mike Head | mike.head@example.com | Head Organizer | Can manage events |
| Admin User | admin@example.com | Admin | Full system access |

**Note**: Any password will work for demo purposes - authentication is mocked.

## Using the App

### 1. Login
- Select a quick login option or enter an email from the table above
- You'll be redirected to the dashboard

### 2. Switch Roles
- Use the role dropdown in the navbar to switch between different user roles
- This allows you to demo all features without re-logging in

### 3. Explore Features

#### As a Player:
- Browse events and sign up
- Create or join groups
- Enter scores for events
- View your statistics

#### As an Organizer:
- Navigate to the "Organizer" panel
- Review and approve/reject submitted scorecards
- Manage your events

#### As a Head Organizer:
- Access the "Head Org" panel
- Approve group rename requests
- Manage events and send notifications

#### As an Admin:
- Open the "Admin" panel
- Manage user roles
- Approve pending event requests

## Project Structure

```
disc-golf-app/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── EventCard.tsx
│   │   ├── GroupCard.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/         # React Context for state management
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   ├── data/            # Mock data and types
│   │   ├── types.ts
│   │   ├── mockUsers.ts
│   │   ├── mockEvents.ts
│   │   ├── mockGroups.ts
│   │   ├── mockScorecards.ts
│   │   ├── mockStats.ts
│   │   ├── mockNotifications.ts
│   │   └── index.ts
│   ├── pages/           # Page components
│   │   ├── AdminPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── HeadOrganizerPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── OrganizerPage.tsx
│   │   ├── ScorecardPage.tsx
│   │   └── StatsPage.tsx
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # App entry point
│   └── index.css        # Tailwind CSS imports
├── API_CALLS.md         # API endpoint documentation
└── README.md            # This file
```

## Key Features Demonstrated

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive grids and layouts
- Hamburger menu for mobile navigation
- Touch-friendly UI elements

### Interactive Components
- Modal dialogs for forms
- Real-time state updates
- Smooth transitions and animations
- Loading states (via Tailwind)

### Data Management
- Context API for global state
- LocalStorage for persistence
- Optimistic UI updates
- CRUD operations for all entities

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Consistent design language
- Helpful empty states
- Informative error messages

## API Documentation

See [API_CALLS.md](./API_CALLS.md) for comprehensive API endpoint documentation. This file includes:
- All required endpoints
- Request/response formats
- Authentication requirements
- Data models
- Error handling
- Notes for backend implementation

## Development Notes

### Mock Data
All data is mocked and stored in the React Context. Changes persist during the session but reset on page refresh. This allows for:
- Easy demonstration of all features
- No backend dependency
- Quick iteration on UI/UX
- Clear understanding of data requirements

### State Management
- **AuthContext**: Handles authentication and role switching
- **DataContext**: Manages all app data (events, groups, scorecards, etc.)
- LocalStorage is used to persist login state between sessions

### Adding New Features
1. Add types to `src/data/types.ts`
2. Create mock data in `src/data/`
3. Add methods to DataContext if needed
4. Create UI components in appropriate pages
5. Update API_CALLS.md with new endpoints

## Future Enhancements

Potential improvements for the actual application:
- Real backend integration
- WebSocket for real-time updates
- Advanced search and filtering
- Data export functionality
- Email notifications
- Mobile app (React Native)
- Progressive Web App (PWA) features
- Advanced analytics and charts
- Social features (comments, likes, etc.)
- Photo uploads for events

## License

This is a demo application. All rights reserved.

## Support

For questions or issues, please contact the development team.

