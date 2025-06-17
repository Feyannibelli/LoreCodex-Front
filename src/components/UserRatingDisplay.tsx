import React, {useEffect, useState} from "react"
import { Rating } from "@smastrom/react-rating"
import "@smastrom/react-rating/style.css"
import ratingService from "../services/ratingService"

type Props = {
    gameId: number
    isAuthenticated: boolean
    initialRating: number | null
    onRated?: (newRating: number) => void
}

const UserRatingDisplay: React.FC<Props> = ({ gameId, isAuthenticated, initialRating, onRated }) => {
    const [rating, setRating] = useState(initialRating ?? 0)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [hasUserRated, setHasUserRated] = useState(initialRating !== null)

    const handleRate = async () => {
        if (!isAuthenticated) {
            setError("You must be logged in.")
            return
        }
        setLoading(true)
        try {
            await ratingService.setRating(gameId, rating)
            setSuccess(true)
            setError(null)
            setHasUserRated(true) // Marca que el usuario ya ha calificado
            onRated?.(rating)
            setTimeout(() => setSuccess(false), 2000)
        } catch {
            setError("Error> cannot send your rating. Try again later.")
        } finally {
            setLoading(false)
        }
    }

    // Solo actualizar si es la primera vez o si no hay un rating previo del usuario
    useEffect(() => {
        if (initialRating !== null && !hasUserRated) {
            setRating(initialRating);
            setHasUserRated(true);
        } else if (initialRating === null && hasUserRated) {
            // Si el rating se eliminó externamente, resetear
            setRating(0);
            setHasUserRated(false);
        }
    }, [initialRating, hasUserRated]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px", fontSize: "20px",
            fontFamily: "sans-serif",
            fontWeight: "bold"
        }}
        >
            <span>Your rating:</span>
            <Rating style={{ maxWidth: 140 }} value={rating} onChange={setRating} readOnly={!isAuthenticated} />
            <button
                onClick={handleRate}
                disabled={!isAuthenticated || rating === 0 || loading}
                className="px-3 py-1 bg-orange-500 text-white rounded disabled:opacity-50"
            >
                {success ? "Done!" : hasUserRated ? "Update" : "Rate"}
            </button>
            {error && <span className="text-red-500">{error}</span>}
        </div>
    )
}

export default UserRatingDisplay