import React, { useState } from 'react';
import '../Login/Login.css';
import Header from '../Header/Header';

const Register = ({ onClose }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(true);

  const register_url = window.location.origin + '/djangoapp/register';

  const register = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(register_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName,
          password: password,
          email: email,
        }),
      });

      const json = await res.json();

      if (res.ok && json.status === 'Authenticated') {
        sessionStorage.setItem('username', json.userName);
        window.location.href = '/';
      } else {
        alert(json.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      alert('Unable to connect to the server. Please try again.');
    }
  };

  if (!open) {
    window.location.href = '/';
  }

  return (
    <div>
      <Header />
      <div onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="modalContainer"
        >
          <form className="login_panel" onSubmit={register}>
            <div>
              <span className="input_field">Username </span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input_field"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div>
              <span className="input_field">Email </span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input_field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <span className="input_field">Password </span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input_field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                className="action_button"
                type="submit"
                value="Register"
              />
              <input
                className="action_button"
                type="button"
                value="Cancel"
                onClick={() => setOpen(false)}
              />
            </div>

            <a className="loginlink" href="/login">
              Already registered? Login
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
