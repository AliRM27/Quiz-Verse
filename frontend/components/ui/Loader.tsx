import LottieView from "lottie-react-native";

const Loader = ({
  width = 40,
  height = 40,
  black = false,
}: {
  width?: number;
  height?: number;
  black?: boolean;
}) => {
  return black ? (
    <LottieView
      style={{
        width,
        height,
        margin: 0,
        padding: 0,
      }}
      autoPlay
      loop
      source={require("@/assets/animations/LoadingBlack.json")}
    />
  ) : (
    <LottieView
      style={{ width, height, margin: 0, padding: 0 }}
      autoPlay
      loop
      source={require("@/assets/animations/Loading....json")}
    />
  );
};

export default Loader;
