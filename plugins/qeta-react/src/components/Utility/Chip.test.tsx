import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders children without a TagGroup/TagList ancestor', () => {
    render(<Chip>hello</Chip>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    render(<Chip href="/foo">link chip</Chip>);
    const link = screen.getByText('link chip').closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', '/foo');
  });

  it('renders as an interactive element and calls onPress when clicked', () => {
    const onPress = jest.fn();
    render(<Chip onPress={onPress}>press me</Chip>);
    fireEvent.click(screen.getByText('press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onClick handler in addition to onPress', () => {
    const onPress = jest.fn();
    const onClick = jest.fn();
    render(
      <Chip onPress={onPress} onClick={onClick}>
        both
      </Chip>,
    );
    fireEvent.click(screen.getByText('both'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <Chip onPress={onPress} isDisabled>
        disabled
      </Chip>,
    );
    fireEvent.click(screen.getByText('disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders the provided icon', () => {
    render(<Chip icon={<svg data-testid="chip-icon" />}>with icon</Chip>);
    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
  });
});
