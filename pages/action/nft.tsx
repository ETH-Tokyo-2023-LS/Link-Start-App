import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";

const OPENSEA_URL = "https://testnets-api.opensea.io/v2/orders/goerli/seaport/";

type ConsiderationModel = any;
type OfferModel = {
  item_type: number;
  token: string;
  identifier_or_criteria: string;
  startAmount: number;
  endAmount: number;
};
type OrderParametersModel = {
  offerer: string;
  offer: OfferModel[];
  consideration: ConsiderationModel[];
  start_time: number;
  end_time: number;
  order_type: number;
  zone: string;
  zone_hash: string;
  salt: string;
  conduitKey: string;
  totalOriginalConsiderationItems: number;
  counter: number;
};
type AccountModel = {
  user: string | null;
  profile_img_url: string;
  address: string;
  config: string;
};
type FeesModel = {
  account: AccountModel;
  basis_points: string;
};
type BundleModel = any;
type OrderModel = {
  created_date: string;
  closing_date: string | null;
  listing_time: number;
  expiration_time: number;
  order_hash: string | null;
  protocol_data: OrderParametersModel[];
  protocol_address: string | null;
  maker: AccountModel;
  taker: AccountModel | null;
  current_price: string;
  maker_fees: FeesModel[];
  taker_fees: FeesModel[];
  side: string;
  order_type: string;
  canceled: boolean;
  finalized: boolean;
  marked_invalid: boolean;
  client_signature: string | null;
  relay_id: string;
  criteria_proof: string | null;
  maker_asset_bundle: BundleModel;
  taker_asset_bundle: BundleModel;
};
type AssetContractModel = any;
type CollectionModel = any;
type AssetModel = {
  id: number;
  token_id: string;
  num_sales: number;
  background_color: string | null;
  image_url: string;
  image_preview_url: string;
  image_thumbnail_url: string;
  image_original_url: string | null;
  animation_url: string | null;
  animation_original_url: string | null;
  name: string;
  description: string | null;
  external_link: string | null;
  asset_contract: AssetContractModel;
  permalink: string;
  collection: CollectionModel;
  decimals: number | null;
  token_metadata: string | null;
  is_nsfw: boolean;
  owner: AccountModel | null;
};

type OpenseaListingProps = {};
type OpenseaListingResponse = {
  orders: OrderModel[];
  next: string;
  previous?: null;
};

type PriceType = {
  unit: string;
  usd: string;
};

type Collection = {
  displayImageUrl: string;
  displayName: string;
  id: string;
  imageUrl: string;
  tokenId: string;
  isDelisted: boolean;
  isCurrentlyFungible: boolean;
  priceType: PriceType;
};
const COLLECTIONS: Collection[] = [
  {
    displayImageUrl: "/bayc1.png",
    displayName: "6103",
    id: "QXNzZXRUeXBlOjE3ODQyNDgzOQ==",
    imageUrl: "/bayc1.png",
    isCurrentlyFungible: false,
    isDelisted: false,
    tokenId: "6103",
    priceType: {
      unit: "4.5",
      usd: "9453.1050000000002475",
    },
  },
  {
    tokenId: "0",
    isDelisted: false,
    id: "QXNzZXRUeXBlOjE3Mzk3ODIzOQ==",
    isCurrentlyFungible: false,
    displayName: "0",
    displayImageUrl: "/mayc.png",
    imageUrl: "/mayc.png",
    priceType: {
      unit: "4.5",
      usd: "9453.1050000000002475",
    },
  },
];

interface CardProps {
  collection: Collection;
}

const Card: React.FC<CardProps> = ({ collection }) => {
  return (
    <div className="flex flex-col justify-between w-full p-4 mb-4 border rounded-lg shadow-md md:w-1/2 lg:w-1/3">
      <div>
        <img
          className="w-full"
          src={collection.imageUrl}
          alt={collection.displayName}
        />
        <h3 className="mt-4 text-lg font-bold">{collection.displayName}</h3>
        <p className="mt-2 text-sm text-gray-600">ID: {collection.id}</p>
        <p className="mt-2 text-lg font-bold text-yellow-600">
          {collection.priceType.unit} ETH
        </p>
      </div>
      <button className="px-4 py-2 mt-4 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
        Buy Now
      </button>
    </div>
  );
};

const NFT = () => {
  return (
    <div className="flex flex-wrap p-4 mb-20">
      {COLLECTIONS.map((collection) => (
        <Card key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

export default NFT;
