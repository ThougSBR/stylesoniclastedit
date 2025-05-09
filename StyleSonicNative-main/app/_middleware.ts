import { useAuthStore } from "../store/authStore";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export default function Middleware() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    setAppMounted(true);
  }, []);

  useEffect(() => {
    if (!appMounted || loading) return; // Wait until app is fully mounted

    const inAuthGroup = segments[0] === "auth";
    const inProfileGroup = segments[0] === "profile";

    if (!user && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Only redirect if we're not in the middle of a signup flow
      if (segments[1] !== "signup") {
        router.replace("/");
      }
    }
  }, [user, loading, segments, appMounted]);

  return null;
}
