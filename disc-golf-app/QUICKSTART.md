# Quick Start Guide

## Running the Application

1. **Navigate to the project directory**:
   ```bash
   cd disc-golf-app
   ```

2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and go to: `http://localhost:5173`

## Quick Login

On the login page, use any of these quick login buttons:
- **John Player** - Basic player experience
- **Sarah Organizer** - Organizer features
- **Mike Head** - Head Organizer capabilities  
- **Admin User** - Full admin access

Or enter any email from the demo accounts. Any password works!

## Feature Tour

### 1. Dashboard
After login, you'll see:
- Quick stats (events, groups, avg score, notifications)
- Upcoming events you're registered for
- Your groups
- Recent scorecards
- Performance statistics

### 2. Switch Roles
In the top-right navbar, use the dropdown to switch between roles:
- Player → Organizer → Head Organizer → Admin

This lets you test all features without logging out!

### 3. Main Features

#### Events (/events)
- Browse all approved events
- Filter by status (all, upcoming, completed)
- View event details
- Sign up for events
- Request new event creation

#### Groups (/groups)
- View your groups
- Create new groups
- Find and join other groups
- Manage group members (as owner)
- Handle join requests

#### Scorecard (/scorecard)
- Create new scorecards for registered events
- Enter scores hole-by-hole
- Save as draft or submit for review
- View scorecard history

#### Stats (/stats)
- Personal performance statistics
- Group statistics
- Event-specific stats
- Historical performance tracking

#### Notifications (/notifications)
- View all notifications
- Mark as read
- Navigate to relevant content

#### Role-Specific Pages
- **Organizer** (/organizer): Review scorecards
- **Head Org** (/head-organizer): Approve rename requests
- **Admin** (/admin): Manage users and approve events

## Testing Workflows

### As Player
1. Browse events and sign up for one
2. Create a group or join existing group
3. Create a scorecard for an event
4. Enter scores and submit
5. Check your stats

### As Organizer
1. Switch role to "Organizer"
2. Go to Organizer panel
3. Review pending scorecards
4. Approve or reject with feedback

### As Head Organizer
1. Switch role to "Head Organizer"  
2. Go to Head Organizer panel
3. View and approve rename requests
4. Manage your events

### As Admin
1. Switch role to "Admin"
2. Go to Admin panel
3. View all users
4. Approve pending event requests

## Tips

- **Data persists during session** but resets on page refresh
- **All interactions are instant** - no loading delays in this demo
- **Mobile responsive** - try resizing your browser or use on mobile
- **Notifications** appear in the navbar bell icon
- **Role switcher** makes it easy to test all features

## Next Steps

1. Explore all pages and features
2. Test different user workflows
3. Review `API_CALLS.md` for backend requirements
4. Provide feedback on UI/UX
5. Identify any missing features

## Troubleshooting

**App won't start?**
- Make sure you're in the disc-golf-app directory
- Run `npm install` again
- Check Node.js version (should be v16+)

**Seeing errors?**
- Refresh the page
- Clear browser cache
- Check browser console for errors

**Features not working?**
- Make sure you're logged in
- Try switching roles to access role-specific features
- Some features require being registered for events or being a group member

## Questions?

Refer to the main README.md or API_CALLS.md for more detailed information.

