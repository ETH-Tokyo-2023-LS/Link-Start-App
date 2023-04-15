import { MobileHeader } from "@/components/MobileHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faPalette,
  faQrcode,
  faClock,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

type ButtonProps = {
  icon: JSX.Element;
  title: string;
  subTitle?: string;
  onClick: () => void;
};
const IconButton: React.FC<ButtonProps> = ({
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

const Action = () => {
  const router = useRouter();
  const handleButtonClick = (action: string) => {
    console.log(action);
    router.push(`/action/${action}`);
  };

  return (
    <div className="max-w">
      <MobileHeader title="Action" />

      <div className="grid grid-cols-2 gap-4 p-4">
        <IconButton
          icon={<FontAwesomeIcon icon={faExchangeAlt} />}
          title="Swap(FT)"
          subTitle="powered by uniswap"
          onClick={() => handleButtonClick("swap")}
        />
        <IconButton
          icon={<FontAwesomeIcon icon={faPalette} />}
          title="Trade(NFT)"
          subTitle="powered by opensea"
          onClick={() => handleButtonClick("Trade")}
        />
        <IconButton
          icon={<FontAwesomeIcon icon={faQrcode} />}
          title="Collect(QR)"
          subTitle="coming soon"
          onClick={() => handleButtonClick("Collect")}
        />
        <IconButton
          icon={<FontAwesomeIcon icon={faClock} />}
          title="SOON"
          subTitle="coming soon"
          onClick={() => handleButtonClick("Comming Soon")}
        />
        <IconButton
          icon={<FontAwesomeIcon icon={faEllipsisH} />}
          title="OTHER"
          subTitle="coming soon"
          onClick={() => handleButtonClick("Other")}
        />
      </div>
    </div>
  );
};

export default Action;
