import React, { memo, useId } from 'react'

const InputField = memo(({ label, value, onChange, type = "text", placeholder = "", min, max, step, required = false }) => {
    const id = useId()

    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="block text-cyan-400 text-sm font-semibold mb-2"
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
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                style={{ colorScheme: 'dark' }}
            />
        </div>
    )
})

InputField.displayName = 'InputField'

export default InputField
