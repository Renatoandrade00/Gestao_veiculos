import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { getApiErrorMessage } from '../services/api';

describe('getApiErrorMessage', () => {
  it('extrai error do corpo da resposta', () => {
    const err = new axios.AxiosError('Request failed');
    err.response = {
      status: 400,
      data: { error: 'Este e-mail já está cadastrado' },
    } as never;
    expect(getApiErrorMessage(err, 'fallback')).toBe('Este e-mail já está cadastrado');
  });

  it('extrai erros do Zod (array de messages)', () => {
    const err = new axios.AxiosError('Request failed');
    err.response = {
      status: 400,
      data: { errors: [{ message: 'Ano inválido' }, { message: 'Marca obrigatória' }] },
    } as never;
    expect(getApiErrorMessage(err, 'fallback')).toBe('Ano inválido, Marca obrigatória');
  });

  it('retorna mensagem de rede quando não há conexão', () => {
    const err = new axios.AxiosError('Network Error');
    err.code = 'ERR_NETWORK';
    expect(getApiErrorMessage(err, 'fallback')).toContain('Sem conexão');
  });

  it('retorna fallback para erro desconhecido', () => {
    expect(getApiErrorMessage(new Error('qualquer'), 'meu fallback')).toBe('meu fallback');
  });
});
