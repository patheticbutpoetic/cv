import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RetakeWarningModal } from './RetakeWarningModal';

const poor = { score: 40, label: 'poor' as const, issues: ['blur' as const], suggestions: ['Hold the phone steady to reduce blur.'] };

describe('<RetakeWarningModal /> (PRD §44)', () => {
  it('shows the warning title and explanation when visible', () => {
    const { getByText } = render(
      <RetakeWarningModal visible result={poor} onRetake={() => {}} onUseAnyway={() => {}} />
    );
    expect(getByText('This scan may not be clear')).toBeTruthy();
    expect(getByText(/Hold the phone steady/)).toBeTruthy();
  });

  it('fires onRetake and onUseAnyway', () => {
    const onRetake = jest.fn();
    const onUseAnyway = jest.fn();
    const { getByLabelText } = render(
      <RetakeWarningModal visible result={poor} onRetake={onRetake} onUseAnyway={onUseAnyway} />
    );
    fireEvent.press(getByLabelText('Retake'));
    fireEvent.press(getByLabelText('Use Anyway'));
    expect(onRetake).toHaveBeenCalled();
    expect(onUseAnyway).toHaveBeenCalled();
  });
});
