import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId:
      "748122014004-qsp2nu1g9s7dg12b5e2b19e9vfkbir8h.apps.googleusercontent.com",
    iosClientId:
      "748122014004-7r9fmi2vjal0vnvc4ft3bjcigcdedqtb.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};
