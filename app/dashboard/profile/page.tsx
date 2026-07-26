
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d7dad2",
  borderRadius: 4,
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  background: "#fff",
  color: "#171b1f",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role")
    .eq("id", user.id)
    .single();

  return (
    <>
      <h1 className="text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        Profile
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "#5b6670" }}>
        Manage your account details.
      </p>

      <div
        className="mt-7 max-w-[440px] rounded-md p-[22px]"
        style={{ background: "#fff", border: "1px solid #d7dad2" }}
      >
        <form action={updateProfile} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Full name
            </label>
            <input name="fullName" defaultValue={profile?.full_name ?? ""} style={inputStyle} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Email
            </label>
            <input value={profile?.email ?? ""} disabled style={{ ...inputStyle, opacity: 0.6 }} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Phone
            </label>
            <input name="phone" defaultValue={profile?.phone ?? ""} style={inputStyle} />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-[3px] py-2.5 text-sm font-semibold text-white"
            style={{ background: "#ff5a1f" }}
          >
            Save changes
          </button>
        </form>
      </div>
    </>

  );
}