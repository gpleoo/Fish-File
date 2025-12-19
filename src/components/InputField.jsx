import React, { memo, useId } from 'react'

const InputField = memo(({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    min,
    max,
    step,
    required = false,
    className = ""
}) => {
    const id = useId()

    return (
        <div className={`mb-3 sm:mb-4 ${className}`}>
            <label
                htmlFor={id}
                className="block text-cyan-400 text-sm sm:text-base font-semibold mb-1.5 sm:mb-2"
            >
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                required={required}
                aria-label={label}
                autoComplete="off"
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-3 sm:px-4 py-3 sm:py-3.5 text-white text-base sm:text-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
                style={{ colorScheme: 'dark' }}
            />
        </div>
    )
})

InputField.displayName = 'InputField'

export default InputField
