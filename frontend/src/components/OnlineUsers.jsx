import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, User, Users } from "lucide-react";
import { fetchOnlineUsers, startHeartbeat } from "../utils/presence.js";
import { colorForName, letterFor } from "../utils/avatar.js";

const POLL_INTERVAL_MS = 30000;
const ONLINE_NOW_THRESHOLD_SECONDS = 45;

function secondsSince(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.max(0, Math.floor((Date.now() - then) / 1000));
}

function formatLastActive(isoString) {
  const seconds = secondsSince(isoString);
  if (seconds < ONLINE_NOW_THRESHOLD_SECONDS) return "Online now";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m ago`;
}

function OnlineUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const stopHeartbeat = startHeartbeat();

    const load = () => {
      fetchOnlineUsers()
        .then(setUsers)
        .catch((err) => console.warn("failed to load online users", err));
    };

    load();
    const pollId = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      stopHeartbeat();
      clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    const listener = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  const onlineNow = users.filter((user) => secondsSince(user.last_active) < ONLINE_NOW_THRESHOLD_SECONDS);
  const recentlyActive = users.filter((user) => secondsSince(user.last_active) >= ONLINE_NOW_THRESHOLD_SECONDS);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-3.5 transition-colors hover:bg-slate-50 hover:-translate-y-px"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`${users.length} people online`}
      >
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <User size={13} />
          <span className="absolute -bottom-px -right-px flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-65" />
            <span className="relative h-[9px] w-[9px] rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
          </span>
        </span>
        <span className="whitespace-nowrap text-[12.5px] font-bold text-gray-700 max-[640px]:hidden">{users.length} </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[120%] z-[1000] w-80 max-h-[440px] animate-slideDown overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-[18px] py-3.5 text-[0.9rem] font-bold text-gray-900">
            <span>Who's online</span>
            <span className="rounded-full bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-[#114a9d]">{users.length}</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {users.length === 0 ? (
              <div className="px-[18px] py-[34px] text-center text-gray-400">
                <Users size={22} className="mx-auto" />
                <p className="mt-2 text-[0.85rem] font-medium">No one else is online right now</p>
              </div>
            ) : (
              <>
                {onlineNow.length > 0 && <OnlineUserGroup title="Online now" users={onlineNow} />}
                {recentlyActive.length > 0 && (
                  <OnlineUserGroup title="Active in the last 5 min" users={recentlyActive} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OnlineUserGroup({ title, users }) {
  return (
    <div className="[&+&]:border-t [&+&]:border-gray-100">
      <div className="bg-[#fbfcfe] px-[18px] pb-1.5 pt-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      {users.map((user) => (
        <div key={user.staff_id} className="flex items-center gap-3 px-[18px] py-2.5 transition-colors hover:bg-gray-50">
          <span
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
            style={{ backgroundColor: colorForName(user.full_name) }}
          >
            {letterFor(user.full_name) || "U"}
            <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[0.86rem] font-semibold text-gray-900">{user.full_name}</span>
            <span className="truncate text-[0.74rem] capitalize text-gray-500">
              {user.role}{user.department ? ` • ${user.department}` : ""}
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap text-[0.72rem] font-semibold text-gray-400">
            {formatLastActive(user.last_active)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default OnlineUsers;
