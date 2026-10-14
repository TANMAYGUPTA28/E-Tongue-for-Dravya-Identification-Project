import { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$&*~';

export default function ScrambleText({
  text = '',
  scrambleSpeed = 25,
  triggerOnHover = true,
  className = '',
}) {
  const [displayText, setDisplayText] = useState(text);
  const isScramblingRef = useRef(false);

  const scramble = () => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;

    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        isScramblingRef.current = false;
        setDisplayText(text);
      }

      iteration += 1 / 3;
    }, scrambleSpeed);
  };

  useEffect(() => {
    scramble();
  }, [text]);

  return (
    <span
      onMouseEnter={() => {
        if (triggerOnHover) scramble();
      }}
      className={className}
    >
      {displayText}
    </span>
  );
}
