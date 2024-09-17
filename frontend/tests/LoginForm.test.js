import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Ensure routing context
import fetchMock from 'jest-fetch-mock';
import LoginForm from '../src/components/LoginForm'; // Adjust the path if needed

beforeEach(() => {
  fetchMock.resetMocks(); // Reset fetch mock before each test
});

test('handles failed login', async () => {
  fetchMock.mockReject(new Error('API failure')); // Mock a failed fetch call

  // Mock console.error to prevent it from logging the error in the test output
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

  // Render LoginForm wrapped in MemoryRouter
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

  // Simulate filling out the form
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

  // Simulate form submission
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // Check if the error message appears
  expect(await screen.findByText(/an error occurred during login/i)).toBeInTheDocument();

  // Restore console.error after the test
  consoleErrorMock.mockRestore();
});
