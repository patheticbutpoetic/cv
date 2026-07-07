import { buildPdfHtml, buildIdCardHtml } from './htmlBuilder';

describe('buildPdfHtml (PRD §17.5)', () => {
  it('renders one .page div per image', () => {
    const html = buildPdfHtml([{ dataUri: 'data:image/jpeg;base64,AAA' }, { dataUri: 'data:image/jpeg;base64,BBB' }]);
    expect(html.match(/class="page"/g)).toHaveLength(2);
    expect(html).toContain('data:image/jpeg;base64,AAA');
    expect(html).toContain('page-break-after: always');
  });

  it('uses object-fit contain for FIT mode', () => {
    expect(buildPdfHtml([{ dataUri: 'x' }], 'FIT')).toContain('object-fit: contain');
  });

  it('uses object-fit cover for FILL mode', () => {
    expect(buildPdfHtml([{ dataUri: 'x' }], 'FILL')).toContain('object-fit: cover');
  });
});

describe('buildIdCardHtml (PRD §46.3)', () => {
  it('includes front and back on one page', () => {
    const html = buildIdCardHtml('data:front', 'data:back', true);
    expect(html.match(/class="page"/g)).toHaveLength(1);
    expect(html).toContain('data:front');
    expect(html).toContain('data:back');
    expect(html).toContain('Front');
    expect(html).toContain('Back');
  });

  it('omits labels when includeLabels is false', () => {
    const html = buildIdCardHtml('data:front', undefined, false);
    expect(html).not.toContain('class="label"');
  });
});
