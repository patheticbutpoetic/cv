import { SCAN_MODES, getModeMeta } from './scanModes';

describe('scan modes (PRD §45)', () => {
  it('defines all six V1.5 modes', () => {
    expect(SCAN_MODES.map((m) => m.mode)).toEqual([
      'document',
      'receipt',
      'id_card',
      'homework_notes',
      'whiteboard',
      'photo_to_pdf',
    ]);
  });

  it('applies the correct default filter per mode (PRD §45.5)', () => {
    expect(getModeMeta('document').defaultFilter).toBe('CLEAN');
    expect(getModeMeta('id_card').defaultFilter).toBe('COLOR');
    expect(getModeMeta('photo_to_pdf').defaultFilter).toBe('ORIGINAL');
  });

  it('defaults every mode to A4 paper', () => {
    SCAN_MODES.forEach((m) => expect(m.defaultPaperSize).toBe('A4'));
  });
});
