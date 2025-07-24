// app/auth.tsx (new file - Auth Screen)
import React from "react";
import { Redirect } from "expo-router";
import AuthScreen from "../src/screens/auth/AuthScreen";
import { useAuth } from "../src/contexts/AuthContext";

export default function Auth() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthScreen />;
}
