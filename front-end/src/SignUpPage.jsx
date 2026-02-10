import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './usetoken';
import axios from 'axios';

export const SignUpPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useToken();
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

  const navigate = useNavigate();

  const onSignUpClicked = async () => {
    try {
      const response = await axios.post('/api/sign-up', {
        email: emailValue,
        password: passwordValue,
      });

      const { token } = response.data;
      setToken(token);

    navigate('/todos', { replace: true });

    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Sign up failed'
      );
    }
  };

  return (
    <div className="content-container">
      <h1>Sign Up</h1>

      {errorMessage && <div className="fail">{errorMessage}</div>}

      <input
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        placeholder="someone@gmail.com"
      />

      <input
        type="password"
        value={passwordValue}
        onChange={e => setPasswordValue(e.target.value)}
        placeholder="password"
      />

      <input
        type="password"
        value={confirmPasswordValue}
        onChange={e => setConfirmPasswordValue(e.target.value)}
        placeholder="confirm password"
      />

      <hr />

      <button
        disabled={
          !emailValue ||
          !passwordValue ||
          passwordValue !== confirmPasswordValue
        }
        onClick={onSignUpClicked}
      >
        Sign Up
      </button>

      <button onClick={() => navigate('/log-in')}>
        Already have an account? Log In
      </button>
    </div>
  );
};
