import React, { useId } from 'react'

const SelectField = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    className = ""
}) => {
    const id = useId()
    const listId = `${id}-list`

    return (
        <div className={`mb-3 sm:mb-4 ${className}`}>
            <label
                htmlFor={id}
                className="block text-cyan-400 text-sm sm:text-base font-semibold mb-1.5 sm:mb-2"
            >
                {label}
            </label>
            <input
                id={id}
                list={listId}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-3 sm:px-4 py-3 sm:py-3.5 text-white text-base sm:text-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
            />
            <datalist id={listId}>
                {[...options].sort((a, b) => a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })).map((opt, i) => (
                    <option key={i} value={opt} />
                ))}
            </datalist>
        </div>
    )
}

export default SelectField
