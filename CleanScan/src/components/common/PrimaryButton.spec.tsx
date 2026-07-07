import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from './PrimaryButton';

describe('<PrimaryButton />', () => {
  it('renders its title', () => {
    const { getByText } = render(<PrimaryButton title="Create PDF" onPress={() => {}} />);
    expect(getByText('Create PDF')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<PrimaryButton title="Save" onPress={onPress} />);
    fireEvent.press(getByLabelText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while loading', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<PrimaryButton title="Save" onPress={onPress} loading />);
    fireEvent.press(getByLabelText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
