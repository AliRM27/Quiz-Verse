import { Dimensions } from "react-native";

export const myHeight = 844;
export const myWidth = 390;

export const HEIGHT = Dimensions.get("window").height;
export const WIDTH = Dimensions.get("window").width;

export const isSmallPhone = WIDTH < 390 || HEIGHT < 750;

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
