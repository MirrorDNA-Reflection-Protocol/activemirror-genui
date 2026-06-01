import ActiveMirrorHomepage from "@/components/active-mirror/ActiveMirrorHomepage";
import { SessionProvider } from "next-auth/react";

export default function Page() {
  return (
    <SessionProvider>
      <ActiveMirrorHomepage />
    </SessionProvider>
  );
}
