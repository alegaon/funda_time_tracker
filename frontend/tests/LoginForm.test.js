import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import LoginForm from '../src/components/LoginForm'; // Adjust the path if needed
import { useNavigate } from 'react-router-dom'; // Import useNavigate for mocking

// Mock useNavigate to return a mock function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

beforeEach(() => {
  fetchMock.resetMocks(); // Reset fetch mock before each test
  const mockNavigate = jest.fn(); // Mock function for navigation
  useNavigate.mockReturnValue(mockNavigate); // Ensure useNavigate returns the mock function
});

test('handles failed login', async () => {
  fetchMock.mockReject(new Error('API failure')); // Mock a failed fetch call

  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText(/an error occurred during login/i)).toBeInTheDocument();

  consoleErrorMock.mockRestore();
});

test('handles successful login and redirects to /dashboard', async () => {
  const mockNavigate = useNavigate(); // Get the mocked navigate function
  fetchMock.mockResponseOnce(JSON.stringify({ token: 'mockToken' })); // Mock a successful login response

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  global.localStorage = localStorageMock;

  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser1' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

  localStorageMock.setItem('username', 'testuser1');
  localStorageMock.setItem('token', 'mockToken');

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'testuser1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mockToken');
  });

  // Check if the mockNavigate was called with the correct argument
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
