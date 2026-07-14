import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUtilisateurDto } from '../utilisateur/dto/create-utilisateur.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly utilisateurService: UtilisateurService
  ) {}

  @Public() 
  @Post('inscription')
  async register(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    console.log('DTO reçu:', createUtilisateurDto);
    return await this.authService.register(createUtilisateurDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return await this.utilisateurService.forgotPassword(email);
  }

  @Public()
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  async resendCode(@Body('email') email: string) {
    return await this.utilisateurService.resendCode(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return await this.utilisateurService.resetPassword(
    resetPasswordDto.email, 
    resetPasswordDto.code, 
    resetPasswordDto.nouveauMotDePasse
  );
}

  @Public()
  @Post('refreshtoken')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) throw new UnauthorizedException('Refresh token manquant');
  
  return await this.authService.refreshTokens(refreshToken);
  }

  @Public() 
  @HttpCode(HttpStatus.OK)
  @Post('connexion')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const result = await this.authService.login(loginDto, req);
    
    // Définit le cookie avec le refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, // Empêche l'accès via JavaScript (XSS)
      secure: process.env.NODE_ENV === 'production', // Uniquement HTTPS en prod
      sameSite: 'strict', // Protection contre le CSRF
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('deconnexion')
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: any) {
  // 1. Supprimer le cookie côté client
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  
  // 2. Supprimer la session en base
    return await this.authService.logout(user.id);
  }
}
