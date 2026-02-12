export interface User {
  id?: number;
  username: string;
  email?: string;
  roles?: string[];
  token?: string;
  type?: string;
  refreshToken?: string;
  expiresIn?: number;
  
  // Champs supplémentaires pour la compatibilité avec différentes API
  accessToken?: string;
  jwt?: string;
  tokenType?: string;
  
  // Méthodes utilitaires
  hasRole?: (role: string) => boolean;
}
