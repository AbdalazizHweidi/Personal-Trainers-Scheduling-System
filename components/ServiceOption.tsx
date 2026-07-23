const ServiceOption = ({
  name,
  sub,
  price,
  selected = false,
  onClick,
}: {
  name: string;
  sub: string;
  price: string;
  selected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-md flex justify-between items-center px-5 py-[18px] mb-2.5 transition-colors duration-150 ${
        onClick ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-flame bg-flame-tint"
          : "border-line hover:border-steel"
      }`}
    >
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-steel mt-[3px]">{sub}</div>
      </div>
      <div className="font-mono text-base">{price}</div>
    </div>
  );
};

export default ServiceOption;
