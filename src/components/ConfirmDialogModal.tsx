import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import {
  X,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react'
import { useBodyScrollLock } from '../utils/scrollLock'

export type DialogVariant = 'danger' | 'warning' | 'emerald' | 'info'

export interface ConfirmOptions {
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: DialogVariant
}

export interface AlertOptions {
  title: string
  message: React.ReactNode
  buttonLabel?: string
  variant?: DialogVariant
}

interface DialogState {
  type: 'confirm' | 'alert'
  title: string
  message: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  variant: DialogVariant
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  showAlert: (options: AlertOptions) => Promise<void>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null)

export const useConfirmDialog = (): ConfirmDialogContextType => {
  const ctx = useContext(ConfirmDialogContext)
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return ctx
}

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const resolverRef = useRef<((result: boolean) => void) | null>(null)

  useBodyScrollLock(Boolean(dialog))

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setDialog({
        type: 'confirm',
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        variant: options.variant || 'warning',
      })
    })
  }, [])

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve()
      setDialog({
        type: 'alert',
        title: options.title,
        message: options.message,
        confirmLabel: options.buttonLabel || 'Got It',
        variant: options.variant || 'info',
      })
    })
  }, [])

  const handleClose = (result: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setDialog(null)
    if (resolve) {
      resolve(result)
    }
  }

  const getVariantConfig = (variant: DialogVariant) => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          headerBg: 'from-rose-50 via-orange-50/40 to-rose-50',
          btnBg: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20',
          Icon: Trash2,
        }
      case 'warning':
        return {
          iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
          headerBg: 'from-amber-50 via-yellow-50/40 to-amber-50',
          btnBg: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/20',
          Icon: AlertTriangle,
        }
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          headerBg: 'from-emerald-50 via-teal-50 to-emerald-50',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20',
          Icon: Sparkles,
        }
      case 'info':
      default:
        return {
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          headerBg: 'from-emerald-50 via-teal-50 to-emerald-50',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20',
          Icon: Info,
        }
    }
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm, showAlert }}>
      {children}

      {dialog && (() => {
        const cfg = getVariantConfig(dialog.variant)
        const IconComp = cfg.Icon

        return (
          <div
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose(false)
            }}
          >
            <div
              className="relative bg-white rounded-3xl max-w-sm w-full my-auto shadow-2xl border border-slate-200 overflow-hidden overscroll-contain shrink-0 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-5 py-4 border-b border-slate-100 bg-gradient-to-r ${cfg.headerBg} flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${cfg.iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate">
                    {dialog.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                {dialog.type === 'confirm' && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer text-center"
                  >
                    {dialog.cancelLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className={`${
                    dialog.type === 'confirm' ? 'flex-1' : 'w-full'
                  } py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5 ${cfg.btnBg}`}
                >
                  {dialog.type === 'alert' && <CheckCircle2 className="w-4 h-4" />}
                  <span>{dialog.confirmLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </ConfirmDialogContext.Provider>
  )
}
