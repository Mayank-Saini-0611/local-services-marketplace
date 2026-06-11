import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

function LottiePlayer({ animationData, loop = true, autoplay = true, style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      animationData: animationData,
    });

    // Cleanup on unmount
    return () => anim.destroy();
  }, [animationData, loop, autoplay]);

  return <div ref={containerRef} style={style} />;
}

export default LottiePlayer;