import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { MailerService } from '../../infra/mailer/mailer.service';
import { UserService } from '../user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new UnauthorizedException('Email already registered');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      cart: { create: {} },
    });

    await this.mailer.send(
      user.email,
      'Welcome to Gofla 🛍️',
      `<h1>Welcome, ${user.firstName}!</h1><p>Your Gofla account is ready. Start exploring — snap, match and shop smarter.</p>`,
    );

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.users.toProfile(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.users.toProfile(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hash(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Refresh token revoked or expired');

    // Rotate: revoke old, issue new.
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    return this.issueTokens(payload.sub, payload.email, payload.role);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: this.hash(refreshToken) },
        data: { revoked: true },
      });
    } else {
      await this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
    }
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    // Always respond success to avoid user enumeration.
    if (user) {
      const token = randomBytes(32).toString('hex');
      // For brevity we email a dev link; production would persist a hashed token.
      await this.mailer.send(
        user.email,
        'Reset your Gofla password',
        `<p>Use this token to reset your password: <code>${token}</code></p>`,
      );
    }
    return { success: true, message: 'If the email exists, a reset link was sent.' };
  }

  private async issueTokens(userId: string, email: string, role: JwtPayload['role']) {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessTtl'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshTtl'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hash(refreshToken), expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
