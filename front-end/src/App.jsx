import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignUpPage } from './SignUpPage';
import { LogInPage } from './LogInPage';
import { PrivateRoute } from './PrivateRoute';
import { useUser } from './useUser';
import Todo from './ToDo';
import { PleaseVerifyEmailPage } from './PleaseVerifyEmailPage';
import { EmailVerificationLandingPage } from './EmailVerificationLandingPage';

function App() {
  const user = useUser();

  return (
    <div className='page-container'>
      <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/log-in" replace />} />

        <Route path="/log-in" element={<LogInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/please-verify" element={<PleaseVerifyEmailPage />} />
        <Route path="/verify-email/:verificationToken" element={<EmailVerificationLandingPage />} />

        <Route
          element={
            <PrivateRoute
              isAllowed={!!user}
              redirectPath="/log-in"
            />
          }
        >
          <Route path="/todos" element={<Todo />} />
        </Route>

      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
