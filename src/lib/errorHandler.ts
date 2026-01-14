import { toast } from 'sonner';

// ==================== Error Types ====================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string, userMessage: string, originalError?: unknown) {
    super(message, code, userMessage, originalError);
    this.name = 'AuthError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string, userMessage: string, originalError?: unknown) {
    super(message, code, userMessage, originalError);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', userMessage, originalError);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', 'Erro de conexão. Verifique sua internet.', originalError);
    this.name = 'NetworkError';
  }
}

// ==================== Error Code Mappings ====================

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'invalid_credentials': 'Email ou senha incorretos',
  'email_not_confirmed': 'Confirme seu email antes de fazer login',
  'user_already_exists': 'Este email já está cadastrado',
  'weak_password': 'Senha muito fraca. Use pelo menos 6 caracteres',
  'invalid_email': 'Email inválido',
  'over_email_send_rate_limit': 'Muitas tentativas. Aguarde alguns minutos',
  'user_not_found': 'Usuário não encontrado',
  'session_expired': 'Sessão expirada. Faça login novamente',
  
  // Database errors
  '23505': 'Este registro já existe',
  '23503': 'Não é possível excluir: existem registros relacionados',
  '42501': 'Sem permissão para esta ação',
  'PGRST116': 'Registro não encontrado',
  '22P02': 'Dados inválidos',
  '23502': 'Campo obrigatório não preenchido',
  '42P01': 'Erro interno do sistema',
  
  // Rate limiting
  'rate_limit': 'Muitas requisições. Aguarde um momento',
  
  // Generic
  'fetch_failed': 'Falha ao carregar dados',
  'save_failed': 'Falha ao salvar dados',
  'delete_failed': 'Falha ao excluir dados',
};

// ==================== Error Parsing ====================

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function parseSupabaseError(error: unknown): { code: string; message: string } {
  if (!error) {
    return { code: 'UNKNOWN', message: 'Erro desconhecido' };
  }

  // Handle Supabase error object
  if (typeof error === 'object' && error !== null) {
    const err = error as SupabaseError;
    
    // Check for code first
    if (err.code && SUPABASE_ERROR_MESSAGES[err.code]) {
      return { code: err.code, message: SUPABASE_ERROR_MESSAGES[err.code] };
    }
    
    // Check message for known patterns
    const message = err.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials')) {
      return { code: 'invalid_credentials', message: SUPABASE_ERROR_MESSAGES['invalid_credentials'] };
    }
    if (message.includes('email not confirmed')) {
      return { code: 'email_not_confirmed', message: SUPABASE_ERROR_MESSAGES['email_not_confirmed'] };
    }
    if (message.includes('user already registered')) {
      return { code: 'user_already_exists', message: SUPABASE_ERROR_MESSAGES['user_already_exists'] };
    }
    if (message.includes('rate limit')) {
      return { code: 'rate_limit', message: SUPABASE_ERROR_MESSAGES['rate_limit'] };
    }
    if (message.includes('jwt expired') || message.includes('session')) {
      return { code: 'session_expired', message: SUPABASE_ERROR_MESSAGES['session_expired'] };
    }
    if (message.includes('network') || message.includes('fetch')) {
      return { code: 'NETWORK_ERROR', message: 'Erro de conexão. Verifique sua internet.' };
    }
    
    // Return original message if no mapping found
    if (err.message) {
      return { code: err.code || 'UNKNOWN', message: err.message };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { code: 'UNKNOWN', message: error };
  }

  return { code: 'UNKNOWN', message: 'Ocorreu um erro inesperado' };
}

// ==================== Error Handlers ====================

export function handleAuthError(error: unknown, context?: string): string {
  const { code, message } = parseSupabaseError(error);
  
  console.error(`[Auth Error${context ? ` - ${context}` : ''}]:`, { code, originalError: error });
  
  return message;
}

export function handleDatabaseError(error: unknown, operation: 'fetch' | 'save' | 'delete' | 'update'): string {
  const { code, message } = parseSupabaseError(error);
  
  const operationMessages: Record<string, string> = {
    fetch: 'Erro ao carregar dados',
    save: 'Erro ao salvar dados',
    delete: 'Erro ao excluir dados',
    update: 'Erro ao atualizar dados',
  };
  
  console.error(`[Database Error - ${operation}]:`, { code, originalError: error });
  
  // If we have a specific mapped message, use it
  if (SUPABASE_ERROR_MESSAGES[code]) {
    return SUPABASE_ERROR_MESSAGES[code];
  }
  
  // Otherwise use operation-specific fallback
  return message || operationMessages[operation];
}

export function handleNetworkError(error: unknown): string {
  console.error('[Network Error]:', error);
  return 'Erro de conexão. Verifique sua internet e tente novamente.';
}

// ==================== Toast Helpers ====================

export function showErrorToast(error: unknown, fallbackMessage = 'Ocorreu um erro'): void {
  const { message } = parseSupabaseError(error);
  toast.error(message || fallbackMessage);
}

export function showAuthErrorToast(error: unknown, context?: string): void {
  const message = handleAuthError(error, context);
  toast.error(message);
}

export function showDatabaseErrorToast(
  error: unknown, 
  operation: 'fetch' | 'save' | 'delete' | 'update',
  entityName?: string
): void {
  const message = handleDatabaseError(error, operation);
  
  const entityMessages: Record<string, Record<string, string>> = {
    transaction: { fetch: 'transações', save: 'transação', delete: 'transação', update: 'transação' },
    category: { fetch: 'categorias', save: 'categoria', delete: 'categoria', update: 'categoria' },
    budget: { fetch: 'orçamentos', save: 'orçamento', delete: 'orçamento', update: 'orçamento' },
  };
  
  if (entityName && entityMessages[entityName]) {
    const entityText = entityMessages[entityName][operation];
    if (message === SUPABASE_ERROR_MESSAGES[`${operation}_failed`]) {
      toast.error(`Erro ao ${operation === 'fetch' ? 'carregar' : operation === 'save' ? 'salvar' : operation === 'delete' ? 'excluir' : 'atualizar'} ${entityText}`);
      return;
    }
  }
  
  toast.error(message);
}

// ==================== Error Boundary Helper ====================

export function logError(error: unknown, context: string): void {
  const { code, message } = parseSupabaseError(error);
  
  console.error(`[${context}]:`, {
    code,
    message,
    originalError: error,
    timestamp: new Date().toISOString(),
  });
}

// ==================== Async Error Wrapper ====================

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    operation: 'fetch' | 'save' | 'delete' | 'update';
    entity?: string;
    showToast?: boolean;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, `${options.operation} ${options.entity || 'data'}`);
    
    if (options.showToast !== false) {
      showDatabaseErrorToast(error, options.operation, options.entity);
    }
    
    throw error;
  }
}
