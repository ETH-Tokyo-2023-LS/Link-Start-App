import { useRouter } from "next/router";

const Content = () => {
  const router = useRouter();
  const { content } = router.query;

  return (
    <div>
      <p>Content: {content}</p>
      <UniswapV3 />
    </div>
  );
};

const UniswapV3 = () => {
  return <div>explorer</div>;
};

export default Content;
