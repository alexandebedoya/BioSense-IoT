"use client"

import { useState } from "react"
import { Wind, Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

interface LoginScreenProps {
  onLogin: () => void
  onGoogleLogin?: () => void // Prop opcional por si la usas desde el padre
}

type AuthMode = 'login' | 'register'

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: ''
  })
  const [errors, setErrors] = useState<string[]>([])

  // CORRECCIÓN: Extraemos googleLogin del hook useAuth
  const { login, register, googleLogin, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password)
        onLogin()
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrors(['Las contraseñas no coinciden'])
          return
        }
        if (formData.nombre.trim().length < 2) {
          setErrors(['El nombre debe tener al menos 2 caracteres'])
          return
        }
        await register({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          confirmPassword: formData.confirmPassword // Añadido para completar el objeto
        })
        await login(formData.email, formData.password)
        onLogin()
      }
    } catch (error: any) {
      setErrors([error.message || 'Error en la autenticación'])
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-3xl p-8 shadow-premium border border-border/50">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Wind className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance text-center">
              BioSense IOT Monitor IoT
            </h1>
            <p className="text-muted-foreground mt-2 text-sm text-center">
              Calidad del aire en tiempo real para tu hogar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="pl-12 h-14 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="pl-12 h-14 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="pl-12 pr-12 h-14 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {authMode === 'register' && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-12 pr-12 h-14 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-14 rounded-2xl text-base font-medium transition-all duration-300",
                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                "shadow-lg hover:shadow-xl hover:shadow-primary/20",
                "disabled:opacity-70"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                authMode === 'login' ? "Iniciar Sesión" : "Crear Cuenta"
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {authMode === 'login' ? (
              <>
                ¿Nuevo?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Crea una cuenta
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-muted-foreground bg-card">o continúa con</span>
            </div>
          </div>

          {/* Social Login Corregido */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-2xl border-border/50 hover:bg-secondary/50 transition-all"
            onClick={() => googleLogin()} // Llamada segura al hook
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </Button>

          <p className="text-center mt-6 text-xs text-muted-foreground leading-relaxed">
            Al continuar, aceptas nuestros{" "}
            <button className="text-primary hover:underline">Términos</button> y{" "}
            <button className="text-primary hover:underline">Política de Privacidad</button>
          </p>
        </div>
      </div>
    </div>
  )
}