import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DocumentCard } from './DocumentCard';
import type { Document } from '@/types/document';

const doc: Document = {
  id: '1',
  name: 'Math Notes',
  pdfUri: 'file://math.pdf',
  pageCount: 3,
  fileSizeBytes: 1.2 * 1024 * 1024,
  paperSize: 'A4',
  quality: 'HIGH',
  compression: 'MEDIUM',
  isFavorite: false,
  createdAt: new Date('2026-07-07').toISOString(),
  updatedAt: new Date('2026-07-07').toISOString(),
};

describe('<DocumentCard />', () => {
  it('shows name and page/size metadata', () => {
    const { getByText } = render(<DocumentCard document={doc} onPress={() => {}} />);
    expect(getByText('Math Notes')).toBeTruthy();
    expect(getByText(/3 pages · 1.2 MB/)).toBeTruthy();
  });

  it('opens on press', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<DocumentCard document={doc} onPress={onPress} />);
    fireEvent.press(getByLabelText('Open Math Notes'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders singular "page" for a one-page document', () => {
    const { getByText } = render(<DocumentCard document={{ ...doc, pageCount: 1 }} onPress={() => {}} />);
    expect(getByText(/1 page ·/)).toBeTruthy();
  });
});
