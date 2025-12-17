import React from 'react'

const SelectField = ({ label, value, onChange, options, placeholder }) => (
    <div className="mb-4">
        <label className="block text-cyan-400 text-sm font-semibold mb-2">{label}</label>
        <input
            list={`${label}-list`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:border-cyan-500 focus:outline-none"
        />
        <datalist id={`${label}-list`}>
            {[...options].sort((a, b) => a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })).map((opt, i) => (
                <option key={i} value={opt} />
            ))}
        </datalist>
    </div>
)

export default SelectField
