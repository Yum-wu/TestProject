import { useState, useCallback, useEffect } from "react";

interface UseNotificationReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotification(): UseNotificationReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "default"
    )
      return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {
      console.warn("通知权限请求失败");
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (typeof Notification === "undefined") return;

      const notify = () => {
        if (Notification.permission === "granted") {
          try {
            const notification = new Notification(title, options);
            notification.onclick = () => {
              window.focus();
            };
          } catch {
            console.warn("通知发送失败");
          }
        }

        window.focus();
      };

      if (Notification.permission === "default") {
        Notification.requestPermission().then((result) => {
          setPermission(result);
          if (result === "granted") {
            notify();
          }
        });
      } else {
        notify();
      }
    },
    [],
  );

  return { permission, requestPermission, sendNotification };
}
