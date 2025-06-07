# Stylized Login Page Component

This component provides an alternative, visually appealing login page with animated effects.

## Features

- Modern gradient background
- Animated input fields that shift label on focus
- Glowing button with border animation effects
- Responsive design
- Error messaging
- Links to registration and password recovery

## Usage

The component is available at the route `/stylized-login` and functions identically to the standard login page but with enhanced visual styling.

## Implementation Details

- Uses CSS animations for the button border effects
- Implements floating label design pattern for form inputs
- Directly integrates with the existing AuthContext for authentication functionality
- Stores styles in `frontend/src/styles/StylizedLogin.css`

## Adding to Other Projects

To add this component to another page:

```jsx
import StylizedLoginPage from './path/to/StylizedLoginPage';

// Then in your component:
<StylizedLoginPage />
```

Make sure to also import the CSS file in your component:

```jsx
import '../styles/StylizedLogin.css';
``` 