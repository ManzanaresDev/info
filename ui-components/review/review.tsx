import Styles from "./review.module.css";
interface ReviewProps {
  text: string;
  ranking: number;
}
function Review({ ...review }: ReviewProps) {
  const stars = Math.min(5, Math.max(0, Math.round(review.ranking)));
  return (
    <div className={Styles["rating"]}>
      <div className={Styles["rating-stars"]}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={
              i < stars
                ? `${Styles["star-empty"]} ${Styles["star-full"]}`
                : `${Styles["star-full"]}`
            }
          >
            ★
          </span>
        ))}
      </div>
      <p className={Styles["rating-text"]}>{review.text}</p>
    </div>
  );
}

export default Review;
