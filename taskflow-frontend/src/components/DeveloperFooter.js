import { GithubOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";

const LINKEDIN_URL = process.env.REACT_APP_DEVELOPER_LINKEDIN || "";
const GITHUB_URL = process.env.REACT_APP_DEVELOPER_GITHUB || "";
const EMAIL = process.env.REACT_APP_DEVELOPER_EMAIL || "";
const PHONE = process.env.REACT_APP_DEVELOPER_PHONE || "";

function LinkedInIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function DeveloperFooter({ variant = "light" }) {
  const isDark = variant === "dark";
  const linkClass = isDark
    ? "text-slate-400 hover:text-white transition-colors"
    : "text-slate-500 hover:text-slate-700 transition-colors";
  const hasLinks = LINKEDIN_URL || GITHUB_URL || EMAIL || PHONE;

  return (
    <div className="flex flex-col items-center gap-2 text-sm">
      <span className={isDark ? "text-slate-500" : "text-slate-500"}>
        Geliştirici: <strong className={isDark ? "text-white" : "text-slate-700"}>Ali Akyüz</strong>
      </span>
      {hasLinks && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {LINKEDIN_URL && (
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-[18px] h-[18px] inline-block align-middle" />
            </a>
          )}
          {GITHUB_URL && (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubOutlined style={{ fontSize: 18 }} />
            </a>
          )}
          {EMAIL && (
            <a
              href={`mailto:${EMAIL}`}
              className={linkClass}
              title="E-posta"
              aria-label="E-posta"
            >
              <MailOutlined style={{ fontSize: 18 }} />
            </a>
          )}
          {PHONE && (
            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              className={linkClass}
              title="Telefon"
              aria-label="Telefon"
            >
              <PhoneOutlined style={{ fontSize: 18 }} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
