import Image from "next/image";

import React, { useEffect } from "react";

type CardItemProps = {
  imageSrc: string;
  title: string;
  description: string;
  link: string;
};
const CardItem: React.FC<CardItemProps> = ({
  imageSrc,
  title,
  description,
  link,
}) => {
  return (
    <a
      href={`explorer/${link}`}
      className="bg-white rounded-md shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out"
    >
      <Image
        className="w-16 h-16 object-cover rounded"
        src={imageSrc}
        alt={title}
        width={128}
        height={128}
      />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </a>
  );
};

type CardListProps = {
  items: any[];
};
const CardList: React.FC<CardListProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <CardItem key={index} {...item} />
      ))}
    </div>
  );
};

const Explorer = () => {
  useEffect(() => {
    const script = document.createElement("script");
    document.head.append(script);
    script.src = "https://cse.google.com/cse.js?cx=042edb19600834d6a";
  }, []);

  const items = [
    {
      imageSrc: "/uniswap.jpeg",
      title: "UniSwap",
      description: "This is a sample description for the first card.",
      link: "uniswap",
    },
    {
      imageSrc: "/opensea.png",
      title: "Opensea",
      description: "This is a sample description for the second card.",
      link: "opensea",
    },
  ];

  return (
    <div className="max-w mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardList items={items} />
      </div>
      <div className="gcse-search" />
    </div>
  );
};

export default Explorer;
