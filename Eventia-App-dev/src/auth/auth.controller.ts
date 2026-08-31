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
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserService } from 'src/user/user.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from 'src/user/dto/register.dto';
import { Role } from 'src/common/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  @Public() 
  @Post('register-client')
  @ApiOperation({ summary: 'Register a new client account' })
  @ApiBody({ type: RegisterDto})
  async registerClient(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto, Role.CLIENT);
  }

  @Public() 
  @Post('register-organizer')
  @ApiOperation({ summary: 'Register a new organizer account' })
  @ApiBody({ type: RegisterDto})
  async registerOrganizer(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto, Role.ORGANIZER);
  }

  @Public() 
  @Get('activate')
  @ApiOperation({ summary: 'Activate account via email link' })
  @ApiQuery({ name: 'token', type: 'string', description: 'Unique activation token' })
  async activateAccount(@Query('token') token: string, @Req() req: Request, @Res() res: Response) {
  try {
    // 1. Ton backend valide le token et active le compte
    const { accessToken, refreshToken } = await this.authService.activateUser(token, req);

    // 2. Ton backend stocke les tokens dans des cookies sécurisés
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' }); // secure: true en prod
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });

    // 3. Redirection DIRECTE vers le Dashboard React (local ou prod)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/organizer/dashboard`);
    
  } catch (error) {
    // En cas d'erreur, rediriger vers une page d'erreur sur le front
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/error`);
  }
}

  // 1. Point d'entrée : Redirige l'utilisateur vers Google
  @Get('google')
  @Public() // Très important : doit être accessible sans token
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ 
    summary: 'Initiate Google login', 
    description: 'Redirects the user to the Google consent page. Do not test directly in Swagger (causes a CORS error).'
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google.' })
  async googleAuth() {
    // Cette fonction ne sera jamais exécutée, Passport intercepte la requête
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  @ApiOperation({ 
    summary: 'Google OAuth callback', 
    description: 'Endpoint called by Google after authentication. Generates tokens and redirects to the frontend.'
  })
  @ApiResponse({ status: 302, description: 'Redirect to the Frontend with accessToken and refreshToken in the URL.' })
  async googleAuthRedirect(@Req() req, @Res() res) {
  // 1. Validation de l'utilisateur Google
  const user = await this.authService.validateGoogleUser(req.user);
  
  // 2. Génération de la paire de tokens
  const { accessToken, refreshToken } = await this.authService.generateTokens(user, req);
  
  const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://eventia-beige.vercel.app';
  // 3. Redirection vers le Front avec les tokens
  // On passe les deux tokens en query params
  res.redirect(
    `${frontendUrl}/auth/activate?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
}

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'Email sent successfully.' })
  async forgotPassword(@Body('email') email: string) {
    return await this.userService.forgotPassword(email);
  }

  @Public()
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'Code resent successfully.' })
  async resendCode(@Body('email') email: string) {
    return await this.userService.resendCode(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with received code' })
  @ApiBody({ type: ResetPasswordDto }) 
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
    throw new BadRequestException('Les mots de passe ne correspondent pas');
  }
  return await this.userService.resetPassword(
    resetPasswordDto.email, 
    resetPasswordDto.code, 
    resetPasswordDto.newPassword
  );
}

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token via cookie' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'New accessToken returned.' })
  async refresh(@Req() req: Request) {
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) throw new UnauthorizedException('Refresh token is missing from cookies');
  
  return await this.authService.refreshTokens(refreshToken);
  }

  @Public() 
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User login and session creation' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful, Refresh Token set in cookie.',
    schema: {
      example: {
        message: 'Login successful',
        email: 'user@example.com',
        role: 'user',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const result = await this.authService.login(loginDto, req);
    
    // Définit le cookie avec le refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, // Empêche l'accès via JavaScript (XSS)
      //secure: process.env.NODE_ENV === 'production', // Uniquement HTTPS en prod
      sameSite: 'strict', // Protection contre le CSRF
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });

    // Retourne les informations nécessaires au client
    return {
      message: result.message,
      email: result.email,
      role: result.role,
      accessToken: result.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and session deletion' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: any) {
  // 1. Supprimer le cookie côté client
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  
  // 2. Supprimer la session en base
    return await this.authService.logout(user.id);
  }
}
