import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";

// Configure how notifications should handle when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
      // console.log(token);
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  };

  const scheduleDailyQuizNotification = async () => {
    // Schedule for 10:00 AM every day
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Quiz Ready! 🧠",
        body: "Test your knowledge and earn rewards. The new daily quiz is live!",
        data: { screen: "quizLevel/daily" },
        sound: true,
      },
      trigger: {
        hour: 10,
        minute: 0,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      },
    });
  };

  const scheduleWeeklyEventNotification = async () => {
    // Schedule for Friday at 6:00 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Weekly Event Started! 🏆",
        body: "The weekly challenge has begun. Compete now!",
        data: { screen: "quizLevel/WeeklyEventNodeScreen" },
        sound: true,
      },
      trigger: {
        weekday: 6, // Friday
        hour: 18,
        minute: 0,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      },
    });
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.screen) {
          router.push(data.screen as any);
        }
      });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    scheduleDailyQuizNotification,
    scheduleWeeklyEventNotification,
  };
};
