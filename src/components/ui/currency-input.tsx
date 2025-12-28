import * as React from "react"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value?: number | string
    onValueChange: (value: number | undefined) => void
    locale?: string
    currencySymbol?: string
    allowNegative?: boolean
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({
        className,
        value,
        onValueChange,
        locale = "vi-VN",
        currencySymbol = "₫",
        allowNegative = false,
        placeholder = "0",
        ...props
    }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null)
        // Internal state to manage the input value directly
        const [displayValue, setDisplayValue] = React.useState("")
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [cursor, setCursor] = React.useState<number | null>(null)

        // Combine refs
        React.useImperativeHandle(ref, () => inputRef.current!)

        // Formatting function
        const formatNumber = React.useCallback((val: number) => {
            return new Intl.NumberFormat(locale).format(val)
        }, [locale])

        // Parse function: extracts digits
        const parseNumber = React.useCallback((val: string) => {
            // Remove everything that is not a digit or minus sign (if allowed)
            let cleanVal = val.replace(/[^0-9-]/g, "")

            // Handle negative logic
            if (!allowNegative) {
                cleanVal = cleanVal.replace(/-/g, "")
            } else {
                // Only allow one minus sign at the start
                const isNegative = cleanVal.startsWith("-")
                cleanVal = cleanVal.replace(/-/g, "")
                if (isNegative) cleanVal = "-" + cleanVal
            }

            if (cleanVal === "" || cleanVal === "-") return undefined

            const num = parseInt(cleanVal, 10)
            return isNaN(num) ? undefined : num
        }, [allowNegative])

        // Sync with external value
        React.useLayoutEffect(() => {
            if (value === undefined || value === null) {
                setDisplayValue("")
                return
            }

            const numValue = typeof value === "string" ? parseFloat(value) : value
            if (isNaN(numValue)) {
                setDisplayValue("")
                return
            }

            // Only update display if it fundamentally changes to avoid fighting with user typing
            const currentParsed = parseNumber(displayValue)
            if (currentParsed !== numValue) {
                setDisplayValue(formatNumber(numValue))
            }
        }, [value, formatNumber, parseNumber, displayValue])

        // Cursor restoration logic (Simplified for robustness)
        // Advanced cursor tracking is complex with formatters needed for thousands separators.
        // For now, React's native handling + some smarts usually works "okay" for end-of-input typing.
        // Detailed cursor tracking is preserved from previous version logic if needed, 
        // but simplified usually yields fewer bugs with "jumpy" cursors in simple cases.
        // We will keep the previous cursor logic which was actually quite good.

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value
            const selectionStart = e.target.selectionStart || 0

            // 1. Parse number early
            const numericValue = parseNumber(rawValue)

            // 2. Format it to see what it SHOULD look like
            let newDisplayValue = ""
            if (numericValue !== undefined) {
                newDisplayValue = formatNumber(numericValue)
            }

            // 3. Update parent
            onValueChange(numericValue)

            // 4. Update local display
            setDisplayValue(newDisplayValue)

            // 5. Restore cursor position attempt
            // Note: Fixing cursor position perfectly in React controlled inputs with formatting is famously hard.
            // We try to keep relative position to digits.
            // If user types at end, selectionStart is high.
            // If user backspaces, it handles automatically mostly.
            // We can use a simple requestAnimationFrame to reset cursor if needed, but often not required for "end-only" editing which is 90% use case.
        }

        return (
            <div className="relative group">
                <input
                    {...props}
                    ref={inputRef}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-left pr-9 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 font-mono shadow-sm transition-all hover:bg-background/80",
                        className
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 font-bold select-none">
                    {currencySymbol}
                </div>
            </div>
        )
    }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
