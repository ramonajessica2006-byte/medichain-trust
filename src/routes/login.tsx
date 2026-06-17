import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Admin Login — MediChain" }] }),
});

function LoginPage() {
  const { user, login, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-hero text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Admin login</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage medicines, manufacturers & reference images.</p>
          </div>
          <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="admin@medichain.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>
            <Button type="submit" disabled={busy || !ready} className="w-full gradient-hero text-white" size="lg">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Create an admin user in your Firebase Console → Authentication → Users.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
