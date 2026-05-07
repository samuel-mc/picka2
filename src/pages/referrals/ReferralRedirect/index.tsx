import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function ReferralRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = (code ?? "").trim().toUpperCase();
    if (!raw) {
      navigate("/", { replace: true });
      return;
    }

    window.localStorage.setItem("picka2_referral_code", raw);
    toast.success("Código de referido aplicado.");
    navigate("/registro", { replace: true });
  }, [code, navigate]);

  return null;
}

