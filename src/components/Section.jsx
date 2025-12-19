import React, { memo } from 'react'
import { ChevronDown, ChevronUp } from './Icons'

const Section = memo(({ icon: Icon, title, isActive, onToggle, children }) => (
    <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gray-900 border-2 border-gray-700">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 sm:p-5 active:bg-gray-800 transition-colors"
            aria-expanded={isActive}
            aria-controls={`section-${title.replace(/\s+/g, '-')}`}
        >
            <div className="flex items-center gap-2.5 sm:gap-4">
                <Icon className="text-cyan-400 flex-shrink-0" width={24} height={24} aria-hidden="true" />
                <h2 className="text-lg sm:text-2xl font-bold text-cyan-400 text-left">{title}</h2>
            </div>
            {isActive ? (
                <ChevronUp className="text-cyan-400 flex-shrink-0" width={24} height={24} aria-hidden="true" />
            ) : (
                <ChevronDown className="text-cyan-400 flex-shrink-0" width={24} height={24} aria-hidden="true" />
            )}
        </button>
        {isActive && (
            <div
                id={`section-${title.replace(/\s+/g, '-')}`}
                className="p-4 sm:p-6 border-t-2 border-gray-700 bg-black/30"
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
