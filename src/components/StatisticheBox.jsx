import React from 'react'

const StatisticheBox = ({ stats }) => {
    if (!stats) return null

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-cyan-900 rounded-lg p-4 border border-cyan-600">
                <p className="text-cyan-300 text-xs font-semibold">totale</p>
                <p className="text-white text-2xl font-bold">{stats.totaleCatture}</p>
            </div>
            <div className="bg-blue-900 rounded-lg p-4 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold">più catturata</p>
                {stats.speciePiuCatturata && (
                    <>
                        <p className="text-white text-lg font-bold">{stats.speciePiuCatturata[0]}</p>
                        <p className="text-blue-300 text-xs">({stats.speciePiuCatturata[1]})</p>
                    </>
                )}
            </div>
            <div className="bg-green-900 rounded-lg p-4 border border-green-600">
                <p className="text-green-300 text-xs font-semibold">peso medio</p>
                <p className="text-white text-2xl font-bold">{stats.pesoMedio} kg</p>
            </div>
        </div>
    )
}

export default StatisticheBox
