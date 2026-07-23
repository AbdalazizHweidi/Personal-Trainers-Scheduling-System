const sizeClasses = {
  sm: "w-9 h-9 text-[13px]",
  md: "w-14 h-14 text-xl",
  lg: "w-16 h-16 text-[22px]",
  xl: "w-[120px] h-[120px] text-[38px]",
};

const Avatar = ({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color: string;
  size?: keyof typeof sizeClasses;
}) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-display text-white shrink-0 ${sizeClasses[size]}`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
