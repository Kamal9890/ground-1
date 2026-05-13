import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import Field from "../../components/Auth/Field";
import PasswordField from "../../components/Auth/PasswordField";
import SocialButton, { GIcon, FbIcon } from "../../components/Auth/SocialButton";
import { useAuth } from "../../contexts/AuthContext";
import logoimg from "../../assets/logo.png.png";
import toast from "react-hot-toast";
import { acceptTeamInvite } from "../../api/dashboard";

const PENDING_INVITE_KEY = "pending_team_invite_token";

export default function Login() {
  const nav = useNavigate();
  const { loginEmail, loginGoogle, loginFacebook, forgot } = useAuth();
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const handlePendingInvite = React.useCallback(async () => {
    const pendingToken = localStorage.getItem(PENDING_INVITE_KEY);
    if (!pendingToken) return;

    try {
      await acceptTeamInvite(pendingToken);
      toast.success("Team invitation accepted successfully");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Failed to accept team invitation";
      toast.error(msg);
    } finally {
      localStorage.removeItem(PENDING_INVITE_KEY);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      await loginEmail(email, pw, remember);
      await handlePendingInvite();
      toast.success("Logged in");
      nav("/onboarding", { replace: true });
    } catch (e: any) {
      let msg = "Login failed";
      const code = e?.code as string | undefined;
      const rawMsg = e?.message as string | undefined;

      const tokenErrorMsg =
        e?.customData?._tokenResponse?.error?.message ||
        e?.customData?._tokenResponse ||
        e?.error?.message ||
        e?.error?.errors?.[0]?.message;

      if (
        code === "auth/invalid-credential" ||
        code === "auth/invalid-email" ||
        tokenErrorMsg === "INVALID_LOGIN_CREDENTIALS"
      ) {
        msg = "Invalid email or password.";
      } else if (code === "auth/network-request-failed") {
        msg = "Network error – please check your connection and try again.";
      } else if (code === "auth/user-disabled") {
        msg = "This account has been disabled. Please contact support.";
      } else if (rawMsg && !rawMsg.startsWith("Firebase: Error")) {
        msg = rawMsg;
      }

      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    if (!email) return setErr("Enter your email above, then click Forgot.");
    try {
      await forgot(email);
      alert("Password reset link sent to your email.");
    } catch (e: any) {
      setErr((e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.detail) ?? "Failed to send reset email");
    }
  };

  const signWith = async (fn: () => Promise<void>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      await handlePendingInvite();
      nav("/onboarding", { replace: true });
    } catch (e: any) {
      setErr((e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.detail ) ?? "Login failed");
      toast.error((e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ) ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const logoImgElement = (
    <img src={logoimg} alt="logo" className="h-[22px] md:h-[25px] w-auto inline-block align-middle" />
  );

  return (
    <AuthLayout
      title={
        <div className="flex flex-wrap gap-2 items-center justify-center text-center px-2">
          <span className="whitespace-nowrap">Welcome to</span> {logoImgElement}
        </div>
      }
      subtitle="Please Log in using the form below"
    >
      <form className="space-y-4 w-full" onSubmit={onSubmit} autoComplete="off">
        <Field
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<MailIcon />}
        />
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Password</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-[12px] text-[#777B7F] hover:text-black/80"
            >
              Forgot password?
            </button>
          </div>

          <PasswordField
            placeholder="•••••••"
            label=""
            value={pw}
            onChange={(e) => setPw((e.target as HTMLInputElement).value)}
          />
        </div>

        <label className="mt-1 flex items-center gap-2 text-[12.5px] text-black/50 cursor-pointer">
          <input
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            type="checkbox"
            className="h-[14px] w-[14px] rounded border-black/50"
          />{" "}
          Remember me
        </label>

        {err && <p className="text-[12.5px] text-red-600 px-1">{err}</p>}

        <button
          disabled={busy}
          type="submit"
          className="w-full h-[45px] md:h-[48px] rounded-lg text-sm bg-primary text-white font-semibold transition-all active:scale-[0.98] hover:brightness-95 disabled:opacity-60 flex items-center justify-center"
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center gap-3 text-black/50 text-[12px] py-1">
          <div className="h-[1px] flex-1 bg-[#777B7F]" />
          <span className="text-base text-[#777777]">or</span>
          <div className="h-[1px] flex-1 bg-[#777B7F]" />
        </div>

        <SocialButton icon={<GIcon />} clickEvent={() => signWith(loginGoogle)}>
          <span className="text-[14px]">Login with Google</span>
        </SocialButton>

        <p className="text-center text-[12.5px] md:text-[14px] text-black/60 pt-1">
          Don't have Account?{" "}
          <a href="/signup" className="text-[#ff6a21] font-medium hover:underline">
            Create a new account
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}

const MailIcon = () => (
  <span className="material-icons text-[18px] md:text-base text-black/50">email</span>
);