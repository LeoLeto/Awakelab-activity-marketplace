import { Fragment } from 'react'

export default function StarRating({ value, onChange, disabled }) {
  const stars = [5, 4, 3, 2, 1]

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <Fragment key={star}>
          <input
            type="radio"
            id={`star${star}`}
            name="stars"
            value={star}
            checked={value === star}
            disabled={disabled}
            onChange={() => onChange(star)}
          />
          <label htmlFor={`star${star}`}>&#9733;</label>
        </Fragment>
      ))}
    </div>
  )
}
