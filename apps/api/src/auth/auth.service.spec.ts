import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import type { AuthUser } from '../common/interfaces/request-user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    createWithPassword: jest.fn(),
  };

  const tokensService = {
    issueTokens: jest.fn(),
    rotate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: TokensService, useValue: tokensService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  const dto = {
    name: 'Katerina',
    email: 'kate@test.com',
    password: 'StrongPass123',
  };

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(tokensService.issueTokens).not.toHaveBeenCalled();
    });

    it('should hash the password and create the user when email is free', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createWithPassword.mockResolvedValue({
        id: '1',
        name: dto.name,
        email: dto.email,
        passwordHash: 'hash',
        role: 'CLIENTE',
      });
      tokensService.issueTokens.mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
      });

      const result = await service.register(dto);

      expect(usersService.createWithPassword).toHaveBeenCalledTimes(1);
      const arg = usersService.createWithPassword.mock.calls[0][0];
      expect(arg.email).toBe(dto.email);

      // El hash guardado debe corresponder a la contraseña enviada
      await expect(
        bcrypt.compare(dto.password, arg.passwordHash),
      ).resolves.toBe(true);
      expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });
  });

  describe('validateLocal', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateLocal('nope@test.com', 'StrongPass123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no password (google account)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: null,
      });

      await expect(
        service.validateLocal('kate@test.com', 'StrongPass123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass1', 10);
      usersService.findByEmail.mockResolvedValue({ id: '1', passwordHash });

      await expect(
        service.validateLocal('kate@test.com', 'WrongPass123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return the user on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('StrongPass123', 10);
      const user = {
        id: '1',
        email: 'kate@test.com',
        name: 'K',
        role: 'CLIENTE',
        passwordHash,
      };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.validateLocal('kate@test.com', 'StrongPass123'),
      ).resolves.toEqual(user);
    });
  });

  describe('login', () => {
    it('should issue tokens for the given user', async () => {
      const user: AuthUser = {
        id: '1',
        email: 'kate@test.com',
        name: 'K',
        role: 'CLIENTE',
        passwordHash: 'h',
      };
      tokensService.issueTokens.mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        user,
      });

      await expect(service.login(user)).resolves.toEqual({
        accessToken: 'a',
        refreshToken: 'r',
        user,
      });
      expect(tokensService.issueTokens).toHaveBeenCalledWith(user);
    });
  });

  describe('refresh', () => {
    it('should delegate rotation to TokensService', async () => {
      tokensService.rotate.mockResolvedValue({ accessToken: 'new' });

      await expect(service.refresh('old-token')).resolves.toEqual({
        accessToken: 'new',
      });
      expect(tokensService.rotate).toHaveBeenCalledWith('old-token');
    });
  });
});
