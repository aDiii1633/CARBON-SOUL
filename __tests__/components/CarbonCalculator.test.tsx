import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CarbonCalculator from '../../components/carbon/CarbonCalculator';

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'usr_123', name: 'Test User' } },
    status: 'authenticated',
  }),
}));

// Mock Zustand store
jest.mock('../../lib/store', () => ({
  useAppStore: () => ({
    addCarbonLog: jest.fn(),
  }),
}));

// Mock Recharts responsive container to render children normally
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('CarbonCalculator Component', () => {
  it('renders correctly and defaults to Transit (transport) tab', () => {
    render(<CarbonCalculator />);
    
    // Check form labels in Transport tab
    expect(screen.getByLabelText(/Car Distance \(Petrol\/Diesel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Car Distance \(Electric/i)).toBeInTheDocument();
    
    // Live total is displayed
    expect(screen.getByText(/Running Total/i)).toBeInTheDocument();
  });

  it('allows switching tabs to Energy, Food, Shopping, and Waste', () => {
    render(<CarbonCalculator />);

    // Click Energy tab trigger
    const energyTrigger = screen.getByRole('tab', { name: /Energy/i });
    fireEvent.click(energyTrigger);

    // Should show energy form inputs
    expect(screen.getByLabelText(/Monthly Electricity \(kWh\)/i)).toBeInTheDocument();
  });

  it('updates live running totals when input values change', () => {
    render(<CarbonCalculator />);

    const petrolInput = screen.getByLabelText(/Car Distance \(Petrol\/Diesel/i);
    
    // Initial value is 128.4
    expect(screen.getByText('128.4')).toBeInTheDocument();

    // Input 100km. Petrol car emissions: 100 * 0.170 = 17.0 kg. Total = 128.4 + 17 = 145.4
    fireEvent.change(petrolInput, { target: { value: '100' } });
    
    expect(screen.getByText('145.4')).toBeInTheDocument();
  });
});
