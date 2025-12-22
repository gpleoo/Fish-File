import React, { memo } from 'react'
import { useTranslation } from '../locales/LanguageContext'

const StatisticheBox = memo(({ stats }) => {
    const { t } = useTranslation()

    if (!stats) return null

    return (
        <div className="grid grid-cols-3 gap-4 mb-6" role="group" aria-label={t('charts.statistics')}>
            <div className="bg-cyan-900 rounded-lg p-4 border border-cyan-600">
                <p className="text-cyan-300 text-xs font-semibold">{t('charts.total')}</p>
                <p className="text-white text-2xl font-bold" aria-label={`${stats.totaleCatture} ${t('map.catches')}`}>
                    {stats.totaleCatture}
                </p>
            </div>
            <div className="bg-blue-900 rounded-lg p-4 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold">{t('charts.mostCaught')}</p>
                {stats.speciePiuCatturata && (
                    <>
                        <p className="text-white text-lg font-bold">{stats.speciePiuCatturata[0]}</p>
                        <p className="text-blue-300 text-xs">({stats.speciePiuCatturata[1]})</p>
                    </>
                )}
            </div>
            <div className="bg-green-900 rounded-lg p-4 border border-green-600">
                <p className="text-green-300 text-xs font-semibold">{t('charts.avgWeight')}</p>
                <p className="text-white text-2xl font-bold" aria-label={`${t('charts.avgWeight')} ${stats.pesoMedio} kg`}>
                    {stats.pesoMedio} kg
                </p>
            </div>
        </div>
    )
})

StatisticheBox.displayName = 'StatisticheBox'

export default StatisticheBox
