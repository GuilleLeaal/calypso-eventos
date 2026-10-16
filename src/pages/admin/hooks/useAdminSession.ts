import { useEffect, useEffectEvent, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

export function useAdminSession(onSignedOut: () => void) {
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSignedOut = useEffectEvent(onSignedOut);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting admin session:", error);
        }

        if (!mounted) return;

        const hasSession = Boolean(data.session);

        setIsLoggedIn(hasSession);
        setSessionReady(true);
      } catch (error) {
        console.error("Unexpected admin session error:", error);

        if (mounted) {
          setIsLoggedIn(false);
          setSessionReady(true);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);

      setIsLoggedIn(hasSession);

      if (!hasSession) {
        handleSignedOut();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    setLoginLoading(false);

    if (error) {
      setLoginError("Email o contraseña incorrectos.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return {
    sessionReady,
    isLoggedIn,
    loginForm,
    setLoginForm,
    loginLoading,
    loginError,
    handleLogin,
    handleLogout,
  };
}
