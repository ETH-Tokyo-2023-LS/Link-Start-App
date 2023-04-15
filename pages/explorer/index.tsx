import Image from "next/image";

import React, { useEffect } from "react";
import { MobileHeader } from "@/components/MobileHeader";

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
      href={link}
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
      imageSrc: "/lens.png",
      title: "LENS",
      description:
        "An open-source protocol that allows developers to create decentralized applications (dApps) on the Ethereum blockchain.",
      link: "https://www.lens.xyz/",
    },
    {
      imageSrc: "/topshot.jpeg",
      title: "NBA Top Shot",
      description:
        "A blockchain-based platform for buying, selling, and trading officially licensed NBA collectibles in the form of digital moments.",
      link: "https://nbatopshot.com/",
    },
    {
      imageSrc: "/uniswap.jpeg",
      title: "Uniswap",
      description:
        "A decentralized exchange that enables the swapping of cryptocurrencies without the need for an intermediary.",
      link: "https://uniswap.org/",
    },
    {
      imageSrc: "/sandbox.jpeg",
      title: "SANDBOX",
      description:
        "A virtual world where users can build, buy, and sell virtual assets.",
      link: "https://www.sandbox.game/jp/",
    },
    {
      imageSrc: "/opensea.png",
      title: "Opensea",
      description:
        "A marketplace for buying and selling digital assets, including non-fungible tokens (NFTs) and other unique digital items.",
      link: "https://opensea.io/ja",
    },
  ];

  return (
    <div className="max-w mb-24">
      <MobileHeader title="Explorer" />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <span className="text-xl font-semibold text-gray-800">
          Recommendations just for you
        </span>
        <div className="mt-2"></div>
        <CardList items={items} />
      </div>
      <hr className="my-2 mx-2 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
      <div className="mx-auto px-4">
        <span className="text-xl font-semibold text-gray-800">
          Search based on token graphs
        </span>
        <div className="mt-2"></div>
        <div className="gcse-search" />
      </div>
    </div>
  );
};

export default Explorer;
