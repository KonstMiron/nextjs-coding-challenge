import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer Component', () => {
  it('renders timer with correct format', () => {
    const futureTime = new Date(Date.now() + 65000);
    render(<Timer endTime={futureTime} />);
    
    expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('calls onTimeUp when timer reaches zero', () => {
    vi.useFakeTimers();
    const onTimeUp = vi.fn();
    const pastTime = new Date(Date.now() - 1000);
    
    render(<Timer endTime={pastTime} onTimeUp={onTimeUp} />);
    
    expect(onTimeUp).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
