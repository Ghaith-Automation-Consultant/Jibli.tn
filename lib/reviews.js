/** Average rating to one decimal, or null when the user has no reviews yet. */
export function averageRating(reviews) {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
}
