import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { SignInPage } from './pages/SignInPage'
import { DesignSystemViewer } from './pages/DesignSystemViewer'
import { AccountPage } from './pages/AccountPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { ImpressumPage } from './pages/ImpressumPage'
import { PricingPage } from './pages/PricingPage'
import { BlogPage } from './pages/BlogPage'

export const router = createBrowserRouter([
  { path: '/',                     element: <App /> },
  { path: '/sign-in',              element: <SignInPage /> },
  { path: '/s/:username/:slug',    element: <DesignSystemViewer /> },
  { path: '/account',             element: <AccountPage /> },
  { path: '/legal/privacy',        element: <PrivacyPage /> },
  { path: '/legal/terms',          element: <TermsPage /> },
  { path: '/impressum',            element: <ImpressumPage /> },
  { path: '/pricing',              element: <PricingPage /> },
  { path: '/blog',                 element: <BlogPage /> },
])
