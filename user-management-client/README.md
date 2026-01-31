# User Management Application

A modern Angular application for user registration, authentication, and profile management. Built with Angular 21, Angular Material, and TypeScript strict mode.

## 🚀 Features

- **User Registration** - Complete registration form with validation
- **Login/Authentication** - Secure login with token management
- **Email Verification** - Email verification flow with resend option
- **Password Reset** - Forgot password and reset password functionality
- **Profile Management** - Edit and update user profile
- **Dashboard** - User dashboard with profile summary
- **Dark/Light Mode** - Theme switching with localStorage persistence
- **Responsive Design** - Mobile-first responsive design
- **Route Guards** - Protected routes with authentication guards
- **HTTP Interceptors** - Auth, error, and loading interceptors
- **Toast Notifications** - User-friendly notifications
- **Loading States** - Global loading indicator
- **SEO Optimized** - Meta tags and structured data

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (or use yarn/pnpm)
- **Angular CLI**: v21.x (will be installed automatically)

## 🛠️ Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd user-management-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🏃 Running the Development Server

### Prerequisites
Make sure the backend is running first (see `../user-management-backend/README.md`)

### Start Frontend:
```bash
ng serve
# or
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Start Backend (in separate terminal):
```bash
cd ../user-management-backend
npm start
```

The backend will run on `http://localhost:3000`

## 🏗️ Building for Production

To build the project for production:

```bash
ng build --configuration production
# or
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## ⚙️ Configuration

### Environment Configuration

API base URL is configured via environment files:

- **Development** (`src/environments/environment.ts`): `http://localhost:3000/api`
- **Production** (`src/environments/environment.prod.ts`): Update `apiUrl` for your production backend

When running `ng serve` (development), the app uses `api-endpoints.dev.constants.ts`.  
When running `ng build` (production), the app uses `environment.prod.ts` via file replacement.

### Email Verification (Mock)

Since there's no real email service, verification tokens are printed to the backend console:

1. Register a new user
2. Check the backend console for the verification token
3. Use the token in the URL: `/verify?token=TOKEN&email=EMAIL`
4. Or use the "Resend verification" button on the verify page

### Theme Configuration

The application supports light and dark themes. Theme preference is stored in localStorage and persists across sessions.

To customize colors, edit `src/assets/styles/variables/_colors.scss`.

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── constants/          # Application constants
│   │   ├── enums/              # TypeScript enums
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces/models
│   │   └── services/           # Core services
│   ├── features/
│   │   ├── auth/               # Authentication features
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── dashboard/          # Dashboard feature
│   │   └── profile/            # Profile feature
│   ├── shared/
│   │   ├── components/         # Shared components
│   │   ├── pipes/              # Custom pipes
│   │   └── validators/         # Custom validators
│   ├── app.config.ts          # Application configuration
│   ├── app.routes.ts          # Route configuration
│   └── app.ts                 # Root component
├── assets/
│   └── styles/                # Global styles
│       ├── variables/         # SCSS variables
│       ├── mixins/            # SCSS mixins
│       └── functions/         # SCSS functions
└── styles.scss                # Global stylesheet
```

## 🎨 Styling

The application uses:
- **SCSS** with BEM methodology
- **CSS Variables** for theming
- **Angular Material** for UI components
- **Mobile-first** responsive design
- **Rem units** for typography

### BEM Naming Convention

All component styles follow BEM (Block Element Modifier) naming:

```scss
.component {
  &__element {
    &--modifier {
    }
  }
}
```

## 🔐 Authentication Flow

1. User registers → receives verification email
2. User verifies email → can login
3. User logs in → receives JWT token
4. Token stored securely → used for authenticated requests
5. Token refresh → automatic token refresh on 401

## 🛡️ Security Features

- JWT token storage (sessionStorage/localStorage)
- HTTP-only cookie support ready
- XSS prevention (Angular built-in sanitization)
- Route guards for protected routes
- Token refresh mechanism
- Secure password validation

## 🌐 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧪 Testing

```bash
# Run all unit tests (Jasmine/Karma)
ng test

# Run tests in headless mode (no watch)
ng test --no-watch --browsers=ChromeHeadless

# Run specific test file (example)
ng test --include='**/profile.component.spec.ts' --no-watch --browsers=ChromeHeadless
```

**353 unit tests** cover services, components, pipes, validators, and guards.

## 📦 Dependencies

### Core Dependencies
- `@angular/core`: ^21.1.1
- `@angular/material`: ^21.1.1
- `rxjs`: ^7.8.1

### Development Dependencies
- `typescript`: ~5.6.2
- `@angular/cli`: ^21.1.1

## 🔧 TypeScript Configuration

The project uses **strict mode** with:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

## 🚦 Available Routes

- `/` - Redirects to dashboard
- `/login` - Login page
- `/register` - Registration page
- `/verify` - Email verification (requires token & email query params)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset (requires token query param)
- `/dashboard` - User dashboard (protected)
- `/profile` - User profile (protected)

## 🎯 Key Features Implementation

### Signals & OnPush
All components use Angular Signals and OnPush change detection for optimal performance.

### Standalone Components
All components are standalone (no NgModules).

### Lazy Loading
All routes use lazy loading for optimal bundle size.

### ViewEncapsulation.None
All components use `ViewEncapsulation.None` for global styling control.

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured
- **Formatting**: Prettier recommended
- **Naming**: PascalCase for components, camelCase for variables

## 🐛 Known Issues

None at this time.

## 🔮 Future Improvements

- [ ] Implement social login
- [ ] Add profile picture upload
- [ ] Implement two-factor authentication
- [ ] Add activity log
- [ ] Implement session management
- [ ] Add PWA support
- [ ] Implement i18n (Hebrew/English)

## 📄 License

MIT License.



---

**Note**: Make sure to update the API endpoints in `api-endpoints.constants.ts` before running the application.
