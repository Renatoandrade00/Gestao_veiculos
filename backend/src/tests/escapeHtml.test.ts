import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../services/alertService';

describe('escapeHtml', () => {
  it('escapa caracteres perigosos', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  it('escapa aspas simples e duplas', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  it('escapa o ampersand primeiro (evita dupla escape)', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
  });

  it('não altera texto simples', () => {
    expect(escapeHtml('Fiat Argo 1.0')).toBe('Fiat Argo 1.0');
  });

  it('escapa payload de injeção de e-mail', () => {
    const payload = 'Renato <script>alert("xss")</script>';
    expect(escapeHtml(payload)).not.toContain('<script>');
  });
});
