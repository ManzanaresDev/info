import Styles from "./read-Plus.module.css";
import { useState, useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  text_read_more: string | "read more";
  text_read_less: string | "read less";
}
export default function ReadMore({
  children,
  text_read_more,
  text_read_less,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (el && el.scrollHeight > el.clientHeight) {
      setShowButton(true);
    }
  }, []);

  return (
    <div>
      <div ref={ref} className={expanded ? "" : `${Styles["clamped-text"]}`}>
        {children}
      </div>

      {showButton && (
        <span
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: "pointer",
            color: "blue",
            fontSize: "15px",
            display: "block",
            paddingTop: "15px",
          }}
        >
          {expanded ? `${text_read_less}` : `${text_read_more}`}
        </span>
      )}
    </div>
  );
}
