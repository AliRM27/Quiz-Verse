import Svg, { Line } from "react-native-svg";

export const LineDashed = ({
  needMargin,
  margin,
}: {
  needMargin?: boolean;
  margin?: number;
}) => {
  return (
    <Svg
      height="1"
      width="100%"
      style={{ marginBottom: needMargin ? margin : 0 }}
    >
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
