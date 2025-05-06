// src/components/AverageRatingDisplay.tsx
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'

type Props = {
    rating: number | null
}

const AverageRatingDisplay: React.FC<Props> = ({ rating }) => {
    if (rating === null) return <span>No ratings yet</span>

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rating style={{ maxWidth: 160 }} value={rating} readOnly />
            <span>{rating.toFixed(1)} / 5</span>
        </div>
    )
}

export default AverageRatingDisplay
