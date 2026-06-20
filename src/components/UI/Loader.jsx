const Loader = ({ size = 100, color = "#3B82F6", className = "" }) => {
  return (
    <div
      className={`flex justify-center items-center w-full h-full ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray="125.5"
          strokeDashoffset="125.5"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            values="125.5;0;125.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default Loader;
