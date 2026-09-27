import { Icon } from "@/components/Icon";
import { contactChannels } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function TopBar({ settings }: { settings: Settings }) {
  const { tel, wa, mail } = contactChannels(settings);
  const c = settings.contact;
  if (!tel && !wa && !mail) return null;
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <span className="topbar__note">Satış · Təmir · Konsultasiya</span>
        <div className="topbar__links">
          {tel && (
            <a href={tel}>
              <Icon name="phone" />
              {c.phone}
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" />
              WhatsApp
            </a>
          )}
          {mail && (
            <a href={mail} className="hide-sm">
              <Icon name="mail" />
              {c.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
