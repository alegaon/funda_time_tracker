import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders login form', () => {
  render(<App />);
  // find h2 element with 'Login' text
  const loginElement = screen.getByText(/Login/i);
  expect(loginElement).toBeInTheDocument();
});
