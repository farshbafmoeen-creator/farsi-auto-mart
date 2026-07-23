import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود / ثبت‌نام | پارت‌بازار" },
      { name: "description", content: "ورود یا ثبت‌نام در پارت‌بازار برای خرید قطعات خودرو." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "register") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setError("لینک تأیید به ایمیل شما ارسال شد.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else navigate({ to: "/account" });
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (err) setError(err.message);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto flex items-center justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> بازگشت به خانه
          </Link>

          <div className="mt-8 rounded-3xl glass-strong p-8">
            <h1 className="text-center text-2xl font-black">
              {mode === "login" ? "ورود به حساب" : "ثبت‌نام"}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {mode === "login" ? "خوش برگشتی!" : "حساب کاربری جدید بساز."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ایمیل"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass bg-accent/50 pr-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="رمز عبور"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass bg-accent/50 pr-10"
                />
              </div>

              {error && (
                <p className={`text-sm ${error.includes("ارسال") || error.includes("تأیید") ? "text-green-400" : "text-destructive"}`}>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] text-primary-foreground glow-primary"
              >
                {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "در حال پردازش..." : mode === "login" ? "ورود" : "ثبت‌نام"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent" />
              <span className="text-xs text-muted-foreground">یا</span>
              <div className="h-px flex-1 bg-accent" />
            </div>

            <Button
              variant="outline"
              onClick={handleGoogle}
              className="w-full gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              ورود با Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "حساب نداری؟ " : "قبلاً ثبت‌نام کردی؟ "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="font-bold text-primary hover:underline"
              >
                {mode === "login" ? "ثبت‌نام" : "ورود"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
