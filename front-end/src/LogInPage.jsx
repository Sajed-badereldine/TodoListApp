import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './usetoken';
import axios from 'axios'
export const LogInPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [token , setToken] = useToken()
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const navigate = useNavigate();

const onLogInClicked = async () => {
  try {
    const response = await axios.post('/api/log-in', {
      email: emailValue,
      password: passwordValue,
    });

    const { token: authToken } = response.data;

    setToken(authToken); 
    navigate('/todos', { replace: true }); 

  } catch (err) {
    setErrorMessage(err.response?.data?.message || 'Login failed');
  }
};



  return (
    <div className="content-container">
      <h1>Log In</h1>
      {errorMessage && <div className="fail">{errorMessage}</div>}
      <input
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        placeholder="someone@gmail.com" />
      <input
        type="password"
        value={passwordValue}
        onChange={e => setPasswordValue(e.target.value)}
        placeholder="password" />
      <hr />
      <button
        disabled={!emailValue || !passwordValue}
        onClick={onLogInClicked}>Log In</button>
      <button onClick={() => navigate('/forgot-password')}>Forgot your password?</button>
      <button onClick={() => navigate('/sign-up')}>Don't have an account? Sign Up</button>
    </div>
  );
}