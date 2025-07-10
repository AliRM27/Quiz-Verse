import Svg, { Line } from "react-native-svg";

export const LineDashed = () => {
  return (
    <Svg height="1" width="100%">
      <Line
        x1="0"
        y1="0"
        x2="100%"
        y2="0"
        stroke="gray"
        strokeWidth="1"
        strokeDasharray="5"
      />
    </Svg>
  );
};
