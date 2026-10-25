import React from 'react'

/**
 * Isola "Pianifica uscita": se la funzione va in errore mostra un avviso
 * al suo posto e il resto dell'app continua a funzionare.
 */
class PianificaErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { errore: null }
    }

    static getDerivedStateFromError(errore) {
        return { errore }
    }

    componentDidCatch(errore, info) {
        console.error('Pianifica uscita: errore isolato', errore, info)
    }

    render() {
        if (!this.state.errore) return this.props.children
        return (
            <div className="mb-3 sm:mb-4 rounded-xl bg-gray-900 border-2 border-gray-700 p-4 text-center">
                <p className="text-yellow-400 text-sm">{this.props.messaggio}</p>
                <button
                    onClick={() => this.setState({ errore: null })}
                    className="mt-3 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm active:bg-gray-600"
                >
                    {this.props.etichettaRiprova}
                </button>
            </div>
        )
    }
}

export default PianificaErrorBoundary
