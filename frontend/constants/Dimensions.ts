import { Dimensions, useWindowDimensions } from "react-native";

export const myHeight = 844;
export const myWidth = 390;

export const HEIGHT = Dimensions.get("screen").height;
export const WIDTH = Dimensions.get("screen").width;

export const isSmallPhone = WIDTH < 380 || HEIGHT < 700;

export const layout = {
  paddingTop: HEIGHT * (50 / myHeight),
  paddingHorizontal: WIDTH * (30 / myWidth),
};

export const Auth = {
  gap: {
    screen: HEIGHT * (80 / myHeight),
    button: HEIGHT * (30 / myHeight),
    txt: HEIGHT * (20 / myHeight),
  },
  width: {
    button: WIDTH * (300 / myWidth),
  },
  height: {
    animation: HEIGHT * (70 / myHeight),
  },
};
