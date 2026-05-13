import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import Field from "../../components/Auth/Field";
import PasswordField from "../../components/Auth/PasswordField";
// import CountryCodePicker from "../../components/Auth/CountryCodePicker"; 
import { useAuth } from "../../contexts/AuthContext";
import logoimg from "../../assets/logo.png.png";

/* ===== (OTP) phone commented ===== */
// const toE164 = (cc: string, raw: string) =>
//   (cc + raw.replace(/[^\d]/g, "")).replace(/^(\+)+/, "+");

/* ===== Email verification ===== */
// import { sendEmailVerification } from "firebase/auth";
// import { auth } from "../../lib/firebase";

export default function Signup() {
  const nav = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pwd, setPwd] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  /* ===== (OTP) state commented ===== */
  // const [cc, setCc] = React.useState("+91");
  // const [localPhone, setLocalPhone] = React.useState("");
  // const [agree, setAgree] = React.useState(false);

  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const mismatch = confirm && confirm !== pwd ? "Password is not matching" : "";

  /* ===== (OTP) derived phone commented ===== */
  // const phoneE164 = toE164(cc, localPhone);

  const validate = () => {
    if (!name.trim()) return "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Valid email is required";
    if (pwd.length < 6) return "Password must be at least 6 characters";
    if (pwd !== confirm) return "Passwords do not match";
    /* ===== (OTP) validations commented ===== */
    // if (!localPhone.trim()) return "Phone number is required";
    // if (!/^\+\d{6,15}$/.test(phoneE164)) return "Enter a valid phone number";
    // if (!agree) return "Please accept the terms";
    return null;
  };

  const mapSignupError = (error: any): string => {
    // Firebase Auth surfaces a `code` like "auth/email-already-in-use".
    // The underlying REST API also uses messages like "EMAIL_EXISTS".
    const firebaseCode: string =
      error?.code ||
      error?.errorInfo?.code ||
      error?.response?.data?.error?.message ||
      "";

    const code = String(firebaseCode).toLowerCase();

    if (
      code.includes("email-already-in-use") ||
      code.includes("email_exists") ||
      code === "auth/account-exists-with-different-credential"
    ) {
      return "An account with this email already exists. Try logging in instead.";
    }
    if (code.includes("invalid-email") || code.includes("invalid_email")) {
      return "That email address looks invalid. Please check and try again.";
    }
    if (code.includes("weak-password") || code.includes("weak_password")) {
      return "Password is too weak. Use at least 6 characters.";
    }
    if (code.includes("operation-not-allowed")) {
      return "Email/password sign-up is currently disabled. Please contact support.";
    }
    if (code.includes("too-many-requests")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (code.includes("network-request-failed")) {
      return "Network error. Please check your connection and try again.";
    }

    // Fall back to whatever readable message the server / SDK provided.
    return (
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      "Signup failed"
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await signup(name.trim(), email.trim(), pwd);
      alert(`Verification email sent to ${email}. Please verify to continue.`);
      nav("/login", { replace: true });
    } catch (e: any) {
      setErr(mapSignupError(e));
    } finally {
      setBusy(false);
    }
  };

  // Mobile ke liye image ki height thodi kam ki hai responsive classes se
  const logoImgElement = <img src={logoimg} alt="logo" className="h-[22px] md:h-[25px] w-auto inline-block align-middle" />;

  return (
    <AuthLayout
      title={
        // flex-wrap lagaya hai taaki chhoti screen pe text aur logo stack ho sakein
        <div className="flex flex-wrap gap-2 items-center justify-center text-center px-1">
          <span className="whitespace-nowrap">Welcome to</span> {logoImgElement}
        </div>
      }
      subtitle="Create your account"
    >
      <form className="space-y-4 w-full" onSubmit={onSubmit} autoComplete="off">
        {/* Container for inputs to ensure vertical stacking on mobile */}
        <div className="flex flex-col gap-4">
          <Field
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon />}
          />
          <Field
            label="Email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<MailIcon />}
          />
          <PasswordField
            label="Set Password"
            placeholder="•••••••"
            value={pwd}
            onChange={(e) => setPwd((e.target as HTMLInputElement).value)}
          />
          <PasswordField
            label="Confirm Password"
            placeholder="•••••••"
            value={confirm}
            onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}
            hint={mismatch}
          />
        </div>

        {/* ===== (OTP) phone UI commented ===== */}
        {/*
        <div>
          <span className="block text-[12.5px] font-semibold mb-1">Phone Number</span>
          <div className="flex gap-2">
            <CountryCodePicker value={cc} onChange={setCc} />
            <input
              className="h-[40px] flex-1 rounded-[8px] border border-black/15 px-3 text-[13.5px] outline-none focus:border-black/30 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)_inset]"
              placeholder="98765 43210"
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value)}
              inputMode="tel"
            />
          </div>
          <p className="mt-1 text-[11px] text-black/50">We'll send an OTP to: <b>{phoneE164}</b></p>
        </div>

        <label className="mt-1 flex items-center gap-2 text-sm text-black/75">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-[18px] w-[18px] rounded border-black/50" /> Accept the terms and conditions
        </label>
        */}

        {err && <p className="text-[12.5px] text-red-600 px-1">{err}</p>}

        <button
          disabled={busy}
          type="submit"
          className="w-full h-[44px] md:h-[48px] rounded-lg bg-primary font-semibold text-white transition-all active:scale-[0.98] hover:brightness-95 disabled:opacity-60 flex items-center justify-center"
        >
          {busy ? "Creating..." : "Create account"}
        </button>

        <p className="text-center text-[12.5px] md:text-[14px] text-black/60 pt-1">
          Already have account? <a href="/login" className="text-[#ff6a21] font-medium hover:underline">Login</a>
        </p>
      </form>
    </AuthLayout>
  );
}

const UserIcon = () => (<span className="material-icons text-[18px] md:text-base text-black/50">person</span>);
const MailIcon = () => (<span className="material-icons text-[18px] md:text-base text-black/50">email</span>);