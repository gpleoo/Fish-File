import React, { memo } from 'react'
import { ChevronDown, ChevronUp } from './Icons'

const Section = memo(({ icon: Icon, title, isActive, onToggle, children }) => (
    <div className="mb-4 rounded-xl overflow-hidden bg-gray-900 border-2 border-gray-700">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 active:bg-gray-800"
            aria-expanded={isActive}
            aria-controls={`section-${title.replace(/\s+/g, '-')}`}
        >
            <div className="flex items-center gap-4">
                <Icon className="text-cyan-400" width={28} height={28} aria-hidden="true" />
                <h2 className="text-2xl font-bold text-cyan-400">{title}</h2>
            </div>
            {isActive ? (
                <ChevronUp className="text-cyan-400" width={28} height={28} aria-hidden="true" />
            ) : (
                <ChevronDown className="text-cyan-400" width={28} height={28} aria-hidden="true" />
            )}
        </button>
        {isActive && (
            <div
                id={`section-${title.replace(/\s+/g, '-')}`}
                className="p-6 border-t-2 border-gray-700 bg-black/30"
                role="region"
                aria-label={title}
            >
                {children}
            </div>
        )}
    </div>
))

Section.displayName = 'Section'

export default Section
