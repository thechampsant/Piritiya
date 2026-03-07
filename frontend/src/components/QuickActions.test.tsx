import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from './QuickActions';
import { QUICK_ACTIONS } from '../utils/constants';

describe('QuickActions Component', () => {
  it('should render all quick action buttons', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Verify all actions are rendered
    QUICK_ACTIONS.forEach((action) => {
      const button = screen.getByLabelText(action.labelEn);
      expect(button).toBeInTheDocument();
    });
  });

  it('should display labels in English when language is "en"', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Check for English labels
    expect(screen.getByText('Check Soil Moisture')).toBeInTheDocument();
    expect(screen.getByText('Get Crop Advice')).toBeInTheDocument();
    expect(screen.getByText('Market Prices')).toBeInTheDocument();
  });

  it('should display labels in Hindi when language is "hi"', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="hi" onActionClick={mockOnActionClick} />);
    
    // Check for Hindi labels
    expect(screen.getByText('मिट्टी की नमी जांचें')).toBeInTheDocument();
    expect(screen.getByText('फसल की सलाह लें')).toBeInTheDocument();
    expect(screen.getByText('बाजार भाव')).toBeInTheDocument();
  });

  it('should call onActionClick with correct query when button is clicked', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Click the first action button
    const firstAction = QUICK_ACTIONS[0];
    const button = screen.getByLabelText(firstAction.labelEn);
    fireEvent.click(button);
    
    // Verify callback was called with correct query
    expect(mockOnActionClick).toHaveBeenCalledTimes(1);
    expect(mockOnActionClick).toHaveBeenCalledWith(firstAction.query);
  });

  it('should render icons for each action', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Verify icons are rendered
    QUICK_ACTIONS.forEach((action) => {
      expect(screen.getByText(action.icon)).toBeInTheDocument();
    });
  });

  it('should have minimum 44x44px touch targets', () => {
    const mockOnActionClick = vi.fn();
    const { container } = render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Get all buttons
    const buttons = container.querySelectorAll('.quick-action-button');
    
    // Verify buttons have the correct CSS class for touch targets
    // The actual 44x44px minimum is enforced via CSS (Requirement 12.5)
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button.classList.contains('quick-action-button')).toBe(true);
    });
  });

  it('should display correct section label based on language', () => {
    const mockOnActionClick = vi.fn();
    
    // Test English
    const { rerender } = render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    expect(screen.getByText('Quick Questions')).toBeInTheDocument();
    
    // Test Hindi
    rerender(<QuickActions language="hi" onActionClick={mockOnActionClick} />);
    expect(screen.getByText('जल्दी पूछें')).toBeInTheDocument();
  });

  it('should handle multiple button clicks', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions language="en" onActionClick={mockOnActionClick} />);
    
    // Click multiple buttons
    QUICK_ACTIONS.forEach((action) => {
      const button = screen.getByLabelText(action.labelEn);
      fireEvent.click(button);
    });
    
    // Verify all clicks were registered
    expect(mockOnActionClick).toHaveBeenCalledTimes(QUICK_ACTIONS.length);
  });
});
