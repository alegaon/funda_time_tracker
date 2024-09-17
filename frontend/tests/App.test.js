import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../src/App'; 
import LoginForm from '../src/components/LoginForm'; 
import RegisterForm from '../src/components/RegisterForm'; 


// Test for /login route rendering LoginForm
test('renders LoginForm at /login route', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </MemoryRouter>
  );
  // Check for an <h2> element with the text 'Login'
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent(/login/i);
});

