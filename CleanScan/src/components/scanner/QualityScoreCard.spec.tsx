import React from 'react';
import { render } from '@testing-library/react-native';
import { QualityScoreCard } from './QualityScoreCard';

describe('<QualityScoreCard />', () => {
  it('shows an excellent score with success copy (PRD §43)', () => {
    const { getByText } = render(
      <QualityScoreCard result={{ score: 95, label: 'excellent', issues: [], suggestions: [] }} />
    );
    expect(getByText('95')).toBeTruthy();
    expect(getByText('Excellent')).toBeTruthy();
  });

  it('lists suggestions for a poor score', () => {
    const { getByText } = render(
      <QualityScoreCard
        result={{ score: 40, label: 'poor', issues: ['blur'], suggestions: ['Hold the phone steady to reduce blur.'] }}
      />
    );
    expect(getByText('Poor')).toBeTruthy();
    expect(getByText('Hold the phone steady to reduce blur.')).toBeTruthy();
  });
});
