import React from 'react'
import { ChevronDown, ChevronUp, Edit, Trash2 } from './Icons'

const ListaGestione = ({
    titolo,
    emoji,
    items,
    nuovoValore,
    setNuovoValore,
    placeholder,
    onAggiungi,
    onModifica,
    onElimina,
    editando,
    setEditando,
    valoreEdit,
    setValoreEdit,
    mostra,
    setMostra
}) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
        <button
            onClick={() => setMostra(!mostra)}
            className="w-full flex items-center justify-between p-4 active:bg-gray-700"
        >
            <h3 className="text-lg font-bold text-cyan-400">
                {emoji} {titolo}
            </h3>
            {mostra ? (
                <ChevronUp className="text-cyan-400" width={20} height={20} />
            ) : (
                <ChevronDown className="text-cyan-400" width={20} height={20} />
            )}
        </button>

        {mostra && (
            <div className="p-4 pt-0">
                {/* Input e pulsante aggiungi */}
                <div className="flex justify-between items-center mb-3">
                    <button
                        onClick={onAggiungi}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        + aggiungi
                    </button>
                </div>
                <input
                    type="text"
                    value={nuovoValore}
                    onChange={(e) => setNuovoValore(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onAggiungi()
                    }}
                    className="w-full mb-3 bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-2 text-white"
                />

                {/* Lista items */}
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center bg-gray-900 rounded px-3 py-2 mb-2"
                    >
                        {editando === item ? (
                            <input
                                type="text"
                                value={valoreEdit}
                                onChange={(e) => setValoreEdit(e.target.value)}
                                onBlur={() => onModifica(item, valoreEdit)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onModifica(item, valoreEdit)
                                }}
                                autoFocus
                                className="flex-1 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-white mr-2"
                            />
                        ) : (
                            <span className="text-gray-300 flex-1">{item}</span>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditando(item)
                                    setValoreEdit(item)
                                }}
                                className="text-blue-500 active:text-blue-400"
                            >
                                <Edit width={16} height={16} />
                            </button>
                            <button
                                onClick={() => onElimina(item)}
                                className="text-red-500 active:text-red-400"
                            >
                                <Trash2 width={16} height={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                        Nessun elemento
                    </p>
                )}
            </div>
        )}
    </div>
)

export default ListaGestione
