import {Dimensions} from "react-native";

const myHeight = 844
const myWidth = 390

export const HEIGHT = Dimensions.get("window").height;
export const WIDTH = Dimensions.get("window").width;

export const Auth = {
    gap: {
        screen: HEIGHT * (80 / myHeight),
        button: HEIGHT * (30 / myHeight),
        txt: HEIGHT * (20 / myHeight),
    },
    width: {
        button: WIDTH * (300 / myWidth)
    },
    height: {
        animation: HEIGHT * (70 / myHeight)
    }
}