import React from 'react'

const InputField = ({ label, value, onChange, type = "text", placeholder = "", min, max, step }) => (
    <div className="mb-4">
        <label className="block text-cyan-400 text-sm font-semibold mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:border-cyan-500 focus:outline-none"
            style={{colorScheme: 'dark'}}
        />
    </div>
)

export default InputField
