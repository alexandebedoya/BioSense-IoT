"use client"

import { useState } from "react"
import { 
  User, 
  Pencil, 
  Users, 
  PawPrint, 
  Home, 
  Moon, 
  Globe, 
  Ruler,
  LogOut,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 1. Definimos la interfaz para recibir la acción de logout
interface ProfileViewProps {
  onLogout: () => void;
}

export function ProfileView({ onLogout }: ProfileViewProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("Español")
  const [units, setUnits] = useState("Métrico")
  const [housingType, setHousingType] = useState("Casa")

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-4 pb-0">
        <h1 className="text-2xl font-bold tracking-tight">Perfil y Configuración</h1>
      </div>

      {/* User Card */}
      <div className="p-4">
        <div className="bg-card rounded-2xl border border-border/50 p-4 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                A
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg uppercase">alex colimba</h2>
              <p className="text-sm text-muted-foreground truncate">alexis10129706@gmail.com</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Home Configuration */}
      <div className="px-4">
        <h2 className="font-semibold text-lg mb-3">Configuración del Hogar</h2>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Habitantes</span>
            </div>
            <span className="font-medium">5</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <PawPrint className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Mascotas</span>
            </div>
            <span className="font-medium">4</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Tipo de Vivienda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{housingType}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <Button variant="ghost" className="w-full mt-3 text-primary font-medium hover:text-primary/80 hover:bg-transparent">
          Guardar Cambios
        </Button>
      </div>

      {/* Preferences */}
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-3">Preferencias</h2>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Modo Oscuro</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors duration-300",
                darkMode ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                  darkMode && "translate-x-5"
                )}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Idioma</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{language}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Unidades</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{units}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button (Corregido) */}
      <div className="px-4 pt-4">
        <Button 
          onClick={() => onLogout()} // 2. Vinculamos la función correctamente
          variant="outline" 
          className="w-full h-12 rounded-2xl border-status-danger/30 text-status-danger hover:bg-status-danger/10 hover:text-status-danger"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}