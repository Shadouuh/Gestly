
import Lottie from "lottie-react";
import { useMemo } from "react";

interface LottieIconProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  size?: number;
}

export function LottieIcon({
  animationData,
  loop = true,
  autoplay = true,
  className,
  size,
}: LottieIconProps) {
  const style = useMemo(() => {
    if (size) {
      return { width: size, height: size };
    }
    return undefined;
  }, [size]);

  return (
    <div className={className} style={style}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
