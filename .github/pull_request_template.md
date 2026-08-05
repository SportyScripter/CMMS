## 📝 Description
<!-- What exactly does this PR introduce? What problem does it solve? -->
Added X to resolve Y.

## 🔗 Related Issues / Tickets
<!-- Link to the Trello card, Jira ticket, or GitHub Issue -->
- Closes #123

## 🛠️ Technical Changes
<!-- Highlight the most important architecture changes or new libraries -->
- Added a new `MachineList` component in React.
- Updated Pydantic schema for the issue model in FastAPI.

## 🧪 How to Test
<!-- Step-by-step instructions for the reviewer -->
1. Start the backend (`uvicorn`) and frontend (`npm run dev`) servers.
2. Log in as a test user.
3. Go to the `/machines` route.
4. Click "Report Issue" and verify that the POST request is sent successfully.

## 📸 Screenshots / Video (Optional)
<!-- Paste UI changes here if this PR affects the frontend -->
| Before | After |
|--------|-------|
| (paste here) | (paste here) |

## ✅ Author Checklist
- [ ] I have performed a self-review of my own code.
- [ ] I have removed unused `console.log` statements and commented-out code.
- [ ] The PR title follows conventional commit guidelines (e.g., `feat:`, `fix:`, `refactor:`).