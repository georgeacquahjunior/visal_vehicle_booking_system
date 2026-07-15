import { useSettings } from "../hooks/useSettings.js";

function Footer() {
  const { settings } = useSettings();

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-2">

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Having trouble?
      </p>

      {/* Contact link */}
      <a
        href={`mailto:${settings.support_email}`}
        className="text-sm font-medium text-gray-700 border-b border-gray-400 hover:text-blue-500 hover:border-blue-500 transition duration-200"
      >
        Contact System Admin
      </a>

      {/* Footer note */}
      <small className="block text-xs text-gray-400 mt-3">
        © {new Date().getFullYear()} Vehicle Booking System |{" "}
        <a
          href="http://www.vaarde.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-600 transition"
        >
          {settings.org_name}
        </a>
      </small>
    </div>
  );
}

export default Footer;