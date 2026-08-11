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
    private readonly utilisateurService: UserService,
    private readonly configService: ConfigService
  ) {}

  @Public() 
  @Post('register-client')
  @ApiOperation({ summary: 'Register pour les clients' })
  @ApiBody({ type: RegisterDto})
  async registerClient(@Body() RegisterDto: RegisterDto) {
    console.log('DTO reçu:', RegisterDto);
    return await this.authService.register(RegisterDto, Role.CLIENT);
  }

  @Public() 
  @Post('register-organisateur')
  @ApiOperation({ summary: 'Register pour les organisateurs' })
  @ApiBody({ type: RegisterDto})
  async registerOrganisateur(@Body() RegisterDto: RegisterDto) {
    console.log('DTO reçu:', RegisterDto);
    return await this.authService.register(RegisterDto, Role.ORGANIZER);
  }

  @Public() 
  @Get('activate')
  @ApiOperation({ summary: 'Activer le compte via le lien reçu par email' })
  @ApiQuery({ name: 'token', type: 'string', description: 'Token d’activation unique' })
  async activateAccount(@Query('token') token: string, @Req() req: Request, @Res() res: Response) {
  try {
    // 1. Ton backend valide le token et active le compte
    const { accessToken, refreshToken } = await this.authService.activateUser(token, req);

    // 2. Ton backend stocke les tokens dans des cookies sécurisés
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' }); // secure: true en prod
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });

    // 3. Redirection DIRECTE vers le Dashboard React (local ou prod)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(`${frontendUrl}/organizer/dashboard`);
    
  } catch (error) {
    // En cas d'erreur, rediriger vers une page d'erreur sur le front
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(`${frontendUrl}/auth/error`);
  }
}

  // 1. Point d'entrée : Redirige l'utilisateur vers Google
  @Get('google')
  @Public() // Très important : doit être accessible sans token
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ 
    summary: 'Initier la connexion avec Google', 
    description: 'Redirige l\'utilisateur vers la page de consentement Google. Ne pas tester directement dans Swagger (provoque une erreur CORS).' 
  })
  @ApiResponse({ status: 302, description: 'Redirection vers Google.' })
  async googleAuth() {
    // Cette fonction ne sera jamais exécutée, Passport intercepte la requête
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  @ApiOperation({ 
    summary: 'Callback Google OAuth', 
    description: 'Endpoint appelé par Google après l\'authentification. Génère les tokens et redirige vers le frontend.' 
  })
  @ApiResponse({ status: 302, description: 'Redirection vers le Front-end avec accessToken et refreshToken dans l\'URL.' })
  async googleAuthRedirect(@Req() req, @Res() res) {
  // 1. Validation de l'utilisateur Google
  const user = await this.authService.validateGoogleUser(req.user);
  
  // 2. Génération de la paire de tokens
  const { accessToken, refreshToken } = await this.authService.generateTokens(user, req);
  
  const frontendUrl = this.configService.get<string>('BACKEND_URL');
  // 3. Redirection vers le Front avec les tokens
  // On passe les deux tokens en query params
  res.redirect(
    `${frontendUrl}/auth/activate?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
}

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander un email de réinitialisation de mot de passe' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'Email envoyé avec succès.' })
  async forgotPassword(@Body('email') email: string) {
    return await this.utilisateurService.forgotPassword(email);
  }

  @Public()
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renvoyer le code de vérification' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'Code renvoyé avec succès.' })
  async resendCode(@Body('email') email: string) {
    return await this.utilisateurService.resendCode(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le code reçu' })
  @ApiBody({ type: ResetPasswordDto }) 
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return await this.utilisateurService.resetPassword(
    resetPasswordDto.email, 
    resetPasswordDto.code, 
    resetPasswordDto.newPassword
  );
}

  @Public()
  @Post('refreshtoken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le jeton d\'accès via le cookie' })
  @ApiCookieAuth() // Indique que cette route nécessite un cookie
  @ApiResponse({ status: 200, description: 'Nouveau accessToken retourné.' })
  async refresh(@Req() req: Request) {
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) throw new UnauthorizedException('Refresh token manquant');
  
  return await this.authService.refreshTokens(refreshToken);
  }

  @Public() 
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur et création de session' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie, Refresh Token mis en cookie.',
    schema: {
      example: {
        message: 'Connexion réussie',
        email: 'exemple@domaine.com',
        role: 'utilisateur',
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('admin/login')
  @ApiOperation({ summary: 'Connexion spécifique pour les administrateurs' })
  async adminLogin(@Body() loginDto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.loginAdmin(loginDto, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion et suppression de session' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie.' })
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: any) {
  // 1. Supprimer le cookie côté client
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  
  // 2. Supprimer la session en base
    return await this.authService.logout(user.id);
  }
}
