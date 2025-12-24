/**
 * Sponsor Section Component
 * Displays fishing shops, associations, and fishing instructors
 */

import React, { useState } from 'react'
import Section from './Section'
import { Heart, Store, Users, Award, Globe, Phone, ExternalLink, ChevronDown, ChevronUp } from './Icons'
import { useTranslation } from '../locales/LanguageContext'

// Sponsor data - can be edited to add/remove sponsors
const SPONSORS_DATA = {
    shops: [
        {
            name: 'Amo La Pesca',
            description: 'Il tuo negozio di fiducia per attrezzatura da surfcasting, bolentino e spinning. Ampia selezione di canne, mulinelli e accessori delle migliori marche.',
            website: 'https://www.amolapesca.it',
            phone: '+39 06 5555 1234',
            email: 'info@amolapesca.it'
        }
    ],
    associations: [
        {
            name: 'LR Surfcasting Academy',
            description: 'Accademia dedicata alla formazione e promozione del surfcasting sportivo. Corsi per principianti e avanzati, eventi e raduni lungo le coste italiane.',
            website: 'https://www.lrsurfcasting.it',
            email: 'academy@lrsurfcasting.it',
            phone: '+39 333 9876 543'
        }
    ],
    masters: [
        {
            name: 'Lorenzo Rossi',
            description: 'Campione regionale di surfcasting 2023. Oltre 20 anni di esperienza nelle tecniche di pesca dalla spiaggia. Disponibile per lezioni private e corsi di gruppo.',
            phone: '+39 347 1234 567',
            email: 'lorenzo.rossi.pesca@gmail.com',
            specialties: ['Surfcasting', 'Beach Ledgering', 'Long Range']
        }
    ]
}

const SponsorCard = ({ sponsor, type }) => {
    const [isOpen, setIsOpen] = useState(false)
    const hasContact = sponsor.website || sponsor.phone || sponsor.email

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header compatto - sempre visibile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-750 transition-colors text-left"
            >
                {sponsor.logo ? (
                    <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        {type === 'shop' && <Store className="w-5 h-5 text-white" />}
                        {type === 'association' && <Users className="w-5 h-5 text-white" />}
                        {type === 'master' && <Award className="w-5 h-5 text-white" />}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{sponsor.name}</h4>
                    {sponsor.specialties && !isOpen && (
                        <p className="text-cyan-400 text-xs truncate">{sponsor.specialties.join(' • ')}</p>
                    )}
                    {!sponsor.specialties && !isOpen && (
                        <p className="text-gray-500 text-xs truncate">Tocca per dettagli</p>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {/* Contenuto espandibile */}
            {isOpen && (
                <div className="px-3 pb-3 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mt-3">{sponsor.description}</p>

                    {sponsor.specialties && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {sponsor.specialties.map((spec, i) => (
                                <span key={i} className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    )}

                    {hasContact && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-cyan-700 active:bg-cyan-800 transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                    Sito
                                </a>
                            )}
                            {sponsor.phone && (
                                <a
                                    href={`tel:${sponsor.phone}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    Chiama
                                </a>
                            )}
                            {sponsor.email && (
                                <a
                                    href={`mailto:${sponsor.email}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Email
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const SponsorCategory = ({ title, icon: Icon, sponsors, type, emptyMessage }) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold">{title}</span>
                    <span className="text-gray-500 text-sm">({sponsors.length})</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-2">
                    {sponsors.length > 0 ? (
                        sponsors.map((sponsor, index) => (
                            <SponsorCard key={index} sponsor={sponsor} type={type} />
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <p className="text-sm">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const SponsorSection = ({ activeSection, setActiveSection }) => {
    const { t } = useTranslation()

    const hasAnySponsors = SPONSORS_DATA.shops.length > 0 ||
        SPONSORS_DATA.associations.length > 0 ||
        SPONSORS_DATA.masters.length > 0

    return (
        <Section
            icon={Heart}
            title={t('sponsors.title')}
            isActive={activeSection === 'sponsor'}
            onToggle={() => setActiveSection(activeSection === 'sponsor' ? null : 'sponsor')}
        >
            <div className="space-y-4">
                {/* Intro message */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-4 text-center">
                    <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">
                        {t('sponsors.description')}
                    </p>
                </div>

                {/* Sponsor categories */}
                <SponsorCategory
                    title={t('sponsors.shops')}
                    icon={Store}
                    sponsors={SPONSORS_DATA.shops}
                    type="shop"
                    emptyMessage={t('sponsors.noShops')}
                />

                <SponsorCategory
                    title={t('sponsors.associations')}
                    icon={Users}
                    sponsors={SPONSORS_DATA.associations}
                    type="association"
                    emptyMessage={t('sponsors.noAssociations')}
                />

                <SponsorCategory
                    title={t('sponsors.masters')}
                    icon={Award}
                    sponsors={SPONSORS_DATA.masters}
                    type="master"
                    emptyMessage={t('sponsors.noMasters')}
                />

                {/* Become sponsor CTA */}
                <div className="bg-gray-800 rounded-lg p-4 border border-dashed border-gray-600 text-center">
                    <p className="text-gray-400 text-sm mb-2">
                        {t('sponsors.becomeSponsor')}
                    </p>
                    <a
                        href="mailto:sponsor@fishfile.app"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('sponsors.contactUs')}
                    </a>
                </div>
            </div>
        </Section>
    )
}

export default SponsorSection
