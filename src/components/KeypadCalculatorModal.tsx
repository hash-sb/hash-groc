import React, { useState, useEffect, useCallback } from 'react'
import { X, Delete, Sparkles, Scale, Check } from 'lucide-react'
import { formatPrice, formatUnitPrice } from '../utils/pricing'

export interface KeypadCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  itemName: string
  storeName: string
  initialValue: number | null
  mode: 'price' | 'quantity'
  unit?: string // e.g. 'pack', 'lb', 'oz', 'ct'
  packageSize?: number | null // for price mode -> live unit price preview
  packageUnit?: string // for price mode
  unitPrice?: number | null // for quantity mode -> live total cost preview
  onApply: (value: number) => void | Promise<void>
}

export const KeypadCalculatorModal: React.FC<KeypadCalculatorModalProps> = ({
  isOpen,
  onClose,
  title,
  itemName,
  storeName,
  initialValue,
  mode,
  unit,
  packageSize,
  packageUnit,
  unitPrice,
  onApply,
}) => {
  const triggerHaptic = (ms: number = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
  }

  // Calculator state
  const formatInitial = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val) || val <= 0) {
      return mode === 'price' ? '0.00' : '1'
    }
    return mode === 'price' ? val.toFixed(2) : String(Number(val.toFixed(2)))
  }

  const [display, setDisplay] = useState<string>(() => formatInitial(initialValue))
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<'+' | '-' | '×' | '÷' | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(true)
  const [history, setHistory] = useState<string>('')

  // Reset state when modal opens or initialValue changes
  useEffect(() => {
    if (isOpen) {
      setDisplay(formatInitial(initialValue))
      setPrevValue(null)
      setOperation(null)
      setWaitingForOperand(true)
      setHistory('')
    }
  }, [isOpen, initialValue, mode])

  const computeResult = (a: number, b: number, op: '+' | '-' | '×' | '÷'): number => {
    let res = b
    if (op === '+') res = a + b
    if (op === '-') res = Math.max(0, a - b)
    if (op === '×') res = a * b
    if (op === '÷') res = b === 0 ? 0 : a / b
    return Number(res.toFixed(mode === 'price' ? 2 : 3))
  }

  const handleDigit = useCallback(
    (digit: string) => {
      triggerHaptic(10)
      setDisplay((prev) => {
        if (waitingForOperand) {
          setWaitingForOperand(false)
          return digit
        }
        if (prev === '0') return digit
        // Limit string length to 8 characters to fit nicely on the display
        if (prev.replace('.', '').length >= 8) return prev
        return prev + digit
      })
    },
    [waitingForOperand]
  )

  const handleDecimal = useCallback(() => {
    triggerHaptic(10)
    setDisplay((prev) => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
        return '0.'
      }
      if (prev.includes('.')) return prev
      return prev + '.'
    })
  }, [waitingForOperand])

  const handleClear = useCallback(() => {
    triggerHaptic(15)
    setDisplay('0')
    setPrevValue(null)
    setOperation(null)
    setHistory('')
    setWaitingForOperand(true)
  }, [])

  const handleBackspace = useCallback(() => {
    triggerHaptic(10)
    setDisplay((prev) => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
      }
      if (prev.length <= 1) return '0'
      return prev.slice(0, -1)
    })
  }, [waitingForOperand])

  const handleOperator = useCallback(
    (nextOp: '+' | '-' | '×' | '÷') => {
      triggerHaptic(12)
      const current = parseFloat(display) || 0

      if (operation && prevValue !== null && !waitingForOperand) {
        const computed = computeResult(prevValue, current, operation)
        setDisplay(String(computed))
        setPrevValue(computed)
        setHistory(`${computed} ${nextOp}`)
      } else {
        setPrevValue(current)
        setHistory(`${current} ${nextOp}`)
      }

      setOperation(nextOp)
      setWaitingForOperand(true)
    },
    [display, operation, prevValue, waitingForOperand, mode]
  )

  const handleEquals = useCallback(() => {
    triggerHaptic(15)
    if (!operation || prevValue === null) return
    const current = parseFloat(display) || 0
    const computed = computeResult(prevValue, current, operation)
    setHistory(`${prevValue} ${operation} ${current} =`)
    setDisplay(String(computed))
    setPrevValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }, [display, operation, prevValue, mode])

  const handleQuickAdjust = (delta: number) => {
    triggerHaptic(10)
    const current = parseFloat(display) || 0
    const nextVal = Math.max(mode === 'quantity' ? 0.05 : 0, Number((current + delta).toFixed(2)))
    setDisplay(mode === 'price' ? nextVal.toFixed(2) : String(nextVal))
    setWaitingForOperand(false)
  }

  const handleSetPreset = (val: number) => {
    triggerHaptic(10)
    setDisplay(mode === 'price' ? val.toFixed(2) : String(val))
    setWaitingForOperand(false)
  }

  const handleApply = async () => {
    triggerHaptic(20)
    let finalNum = parseFloat(display) || 0
    // If an operation is pending, resolve it first
    if (operation && prevValue !== null) {
      finalNum = computeResult(prevValue, finalNum, operation)
    }

    if (mode === 'price') {
      const rounded = Number(Math.max(0, finalNum).toFixed(2))
      await onApply(rounded)
    } else {
      const rounded = Number(Math.max(0.01, finalNum).toFixed(2))
      await onApply(rounded)
    }
    onClose()
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleDigit(e.key)
      } else if (e.key === '.') {
        e.preventDefault()
        handleDecimal()
      } else if (e.key === '+') {
        e.preventDefault()
        handleOperator('+')
      } else if (e.key === '-') {
        e.preventDefault()
        handleOperator('-')
      } else if (e.key === '*') {
        e.preventDefault()
        handleOperator('×')
      } else if (e.key === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault()
        if (operation) {
          handleEquals()
        } else {
          handleApply()
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
    handleApply,
    onClose,
    operation,
  ])

  if (!isOpen) return null

  // Live previews
  const currentNum = parseFloat(display) || 0

  // For price mode: preview unit price if packageSize is available
  const liveUnitPrice =
    mode === 'price' && packageSize && packageSize > 0 && currentNum > 0
      ? Number((currentNum / packageSize).toFixed(4))
      : null

  // For quantity mode: preview total fulfillment cost if unitPrice is available
  const liveTotalCost =
    mode === 'quantity' && unitPrice && unitPrice > 0 && currentNum > 0
      ? Number((currentNum * unitPrice).toFixed(2))
      : null

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-4 sm:p-5 space-y-3.5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              <span className="font-bold text-slate-800">{itemName}</span>
              {storeName ? ` at ${storeName}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Contrast Calculator Display Screen */}
        <div className="bg-slate-900 rounded-2xl p-3.5 text-white shadow-inner flex flex-col justify-between min-h-[96px] border border-slate-800">
          {/* Equation / History Row */}
          <div className="text-xs font-mono text-emerald-400 font-semibold h-4 truncate">
            {history || '\u00A0'}
          </div>

          {/* Primary Number Display */}
          <div className="flex items-baseline justify-between gap-2 my-1">
            <div className="flex items-baseline min-w-0">
              {mode === 'price' && (
                <span className="text-emerald-400 text-2xl font-black font-mono mr-1.5">$</span>
              )}
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white truncate">
                {display}
              </span>
              {mode === 'quantity' && unit && (
                <span className="text-slate-400 text-xs font-bold font-mono ml-2 truncate">
                  {unit}
                </span>
              )}
            </div>

            {/* In-display Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              className="text-slate-400 hover:text-white active:scale-90 transition p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Live Preview Sub-row */}
          <div className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1">
            {mode === 'price' && liveUnitPrice !== null && packageUnit && (
              <span className="text-indigo-300 flex items-center gap-1 font-semibold">
                <Scale className="w-3 h-3 text-indigo-400" />
                Unit Price: {formatUnitPrice(liveUnitPrice, packageUnit)}
              </span>
            )}
            {mode === 'quantity' && liveTotalCost !== null && unitPrice && (
              <span className="text-emerald-300 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Estimated: {currentNum} × {formatPrice(unitPrice)} = {formatPrice(liveTotalCost)}
              </span>
            )}
            {!liveUnitPrice && !liveTotalCost && (
              <span className="text-slate-500">Tap keypad to enter {mode}</span>
            )}
          </div>
        </div>

        {/* Quick Adjustment / Presets Bar */}
        {mode === 'price' ? (
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '-$1.00', delta: -1.0 },
              { label: '-$0.10', delta: -0.1 },
              { label: '+$0.10', delta: 0.1 },
              { label: '+$1.00', delta: 1.0 },
            ].map((step) => (
              <button
                key={step.label}
                type="button"
                onClick={() => handleQuickAdjust(step.delta)}
                className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl text-xs font-bold font-mono text-slate-700 active:scale-95 transition cursor-pointer text-center"
              >
                {step.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {[0.5, 1, 1.5, 2, 3, 5].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSetPreset(preset)}
                className={`py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer active:scale-95 ${
                  currentNum === preset
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* 4x5 Calculator Keypad */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-black text-lg border border-rose-200/70 transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs"
            title="Clear"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className={`py-3 rounded-xl font-black text-xl border transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs ${
              operation === '÷'
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/70'
            }`}
            title="Divide"
          >
            ÷
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className={`py-3 rounded-xl font-black text-xl border transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs ${
              operation === '×'
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/70'
            }`}
            title="Multiply"
          >
            ×
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold border border-slate-200 transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => handleDigit('7')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleDigit('8')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleDigit('9')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('-')}
            className={`py-3 rounded-xl font-black text-xl border transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs ${
              operation === '-'
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/70'
            }`}
            title="Subtract"
          >
            −
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => handleDigit('4')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleDigit('5')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleDigit('6')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className={`py-3 rounded-xl font-black text-xl border transition cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs ${
              operation === '+'
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/70'
            }`}
            title="Add"
          >
            +
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => handleDigit('1')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleDigit('2')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleDigit('3')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            3
          </button>
          {/* Equals spanning rows 4 and 5 */}
          <button
            type="button"
            onClick={handleEquals}
            className="row-span-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-2xl transition cursor-pointer active:scale-95 flex items-center justify-center shadow-sm"
            title="Calculate"
          >
            =
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="col-span-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDecimal}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black text-xl border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Decimal point"
          >
            .
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {mode === 'price'
                ? `Save Price (${formatPrice(currentNum)})`
                : `Apply Quantity (${currentNum}${unit ? ` ${unit}` : ''})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
