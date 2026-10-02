import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';
import '@testing-library/jest-dom/vitest';  
import { describe, it, expect} from 'vitest';

describe('ErrorMessage', () => {
  it('renders the message text passed to it', () => {
    render(<ErrorMessage message="Bad credentials" />);
    expect(screen.getByText('Bad credentials')).toBeInTheDocument();
  });

  it('renders nothing meaningful when the message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container).toHaveTextContent(''); // no leftover text
  });
});