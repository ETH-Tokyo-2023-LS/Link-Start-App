import React from "react";

export type ButtonProps = {
  icon: JSX.Element;
  title: string;
  subTitle?: string;
  onClick: () => void;
};

export const IconButton: React.FC<ButtonProps> = ({
  icon,
  title,
  subTitle,
  onClick,
}) => {
  return (
    <button
      className="flex flex-col items-center space-y-1 p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
      onClick={onClick}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xl font-semibold">{title}</span>
        {subTitle && <span className="text-xs">{subTitle}</span>}
      </div>
    </button>
  );
};
