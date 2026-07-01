import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-maintenance-app';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha inválida'),
});

export async function register(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Verificar se o e-mail já existe
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Criar o usuário
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    // Gerar JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao registrar usuário' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao autenticar' });
  }
}

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).userId;
  
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
