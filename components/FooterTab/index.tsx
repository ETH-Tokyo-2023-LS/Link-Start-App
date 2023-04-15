import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faBolt, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

type FooterTabProps = {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
};
const FooterTab: React.FC<FooterTabProps> = ({ icon, label, onClick }) => {
  return (
    <button
      className="flex flex-col items-center space-y-1 p-4 text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
};

export const Footer: React.FC = () => {
  const router = useRouter();

  const handleTabClick = (tab: string) => {
    console.log(`Selected tab: ${tab}`);
    router.push(tab);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around bg-white shadow-md">
      <FooterTab
        icon={<FontAwesomeIcon icon={faWallet} />}
        label="Wallet"
        onClick={() => handleTabClick("/wallet")}
      />
      <FooterTab
        icon={<FontAwesomeIcon icon={faBolt} />}
        label="Action"
        onClick={() => handleTabClick("/action")}
      />
      <FooterTab
        icon={<FontAwesomeIcon icon={faSearch} />}
        label="Explorer"
        onClick={() => handleTabClick("/explorer")}
      />
    </div>
  );
};
