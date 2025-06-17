// src/components/UserRatingDisplay.tsx
import { Rating } from "@smastrom/react-rating"
import "@smastrom/react-rating/style.css"

type Props = {
    rating: number
    size?: number // opcional, si queremos un tamaño específico
}

const UserRatingDisplay: React.FC<Props> = ({ rating }) => {
    if (rating === 0) return null

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <span>Your rating:</span>
            <Rating style={{ maxWidth: 140 }} value={rating} readOnly />
            <span>{rating.toFixed(1)} / 5</span>
        </div>
    )
}

export default UserRatingDisplay
