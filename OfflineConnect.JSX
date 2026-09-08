import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   THEME / CONFIG — the ONE place to change visuals & core behavior.
   Change colors, fonts, spacing, radius, or the word-limit here and the
   whole app updates. Nothing below this block should hardcode a color,
   font, or the word limit — always reference CONFIG / CSS vars.
   ========================================================================= */
const CONFIG = {
  // -- Behavior --
  MAX_WORDS_PER_MESSAGE: 12,
  POLL_INTERVAL_MS: 4000,
  GROUP_CODE_LENGTH: 5,

  // -- Palette (named, so it reads like a real token system) --
  colors: {
    board: "#C9A876",      // corkboard background
    boardShadow: "#00000022",
    paper: "#EFE7D6",      // card/paper surface
    paperEdge: "#D8CBAA",
    ink: "#26333A",        // primary text
    inkSoft: "#5B6A70",    // secondary text
    accent: "#B5651D",     // rust pushpin / primary action
    accentSoft: "#E7B27A",
    highlight: "#F2C14E",  // matching-tag highlight
    sage: "#7C9885",       // secondary action / success
    danger: "#A9432E",
    white: "#FFF9EE",
  },

  // -- Typography --
  fonts: {
    display: "'Caveat', cursive",       // handwritten, note-on-a-corkboard feel
    body: "'Inter', system-ui, sans-serif",
  },

  radius: "10px",
  cardTilt: "-1deg", // subtle pinned-note tilt on cards
};

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600;700&display=swap";

/* =========================================================================
   STYLE SHEET — generated from CONFIG. Edit CONFIG above, not this.
   ========================================================================= */
function GlobalStyles() {
  const c = CONFIG.colors;
  return (
    <style>{`
      @import url('${FONT_IMPORT_URL}');

      .oc-root {
        --board: ${c.board};
        --paper: ${c.paper};
        --paper-edge: ${c.paperEdge};
        --ink: ${c.ink};
        --ink-soft: ${c.inkSoft};
        --accent: ${c.accent};
        --accent-soft: ${c.accentSoft};
        --highlight: ${c.highlight};
        --sage: ${c.sage};
        --danger: ${c.danger};
        --white: ${c.white};
        --radius: ${CONFIG.radius};
        --font-display: ${CONFIG.fonts.display};
        --font-body: ${CONFIG.fonts.body};

        font-family: var(--font-body);
        color: var(--ink);
        min-height: 100vh;
        background:
          radial-gradient(circle at 1px 1px, ${c.boardShadow} 1px, transparent 0) 0 0/16px 16px,
          var(--board);
        display: flex;
        justify-content: center;
        padding: 24px 16px;
        box-sizing: border-box;
      }
      .oc-root * { box-sizing: border-box; }

      .oc-shell {
        width: 100%;
        max-width: 480px;
      }

      .oc-h1 {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 2.4rem;
        line-height: 1;
        margin: 0 0 4px 0;
        color: var(--ink);
      }
      .oc-h2 {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.7rem;
        margin: 0 0 10px 0;
      }
      .oc-sub {
        color: var(--ink-soft);
        font-size: 0.92rem;
        margin: 0 0 18px 0;
        line-height: 1.4;
      }

      .oc-card {
        background: var(--paper);
        border: 1px solid var(--paper-edge);
        border-radius: var(--radius);
        padding: 20px;
        box-shadow: 0 6px 0 var(--paper-edge), 0 10px 18px rgba(0,0,0,0.18);
        transform: rotate(${CONFIG.cardTilt});
        margin-bottom: 18px;
      }
      .oc-card.flat { transform: none; }

      .oc-pin {
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--accent);
        display: inline-block;
        box-shadow: 0 2px 3px rgba(0,0,0,0.35);
        margin-bottom: 8px;
      }

      .oc-btn {
        font-family: var(--font-body);
        font-weight: 600;
        font-size: 0.95rem;
        border: none;
        border-radius: var(--radius);
        padding: 12px 18px;
        cursor: pointer;
        width: 100%;
        transition: transform 0.08s ease, filter 0.15s ease;
      }
      .oc-btn:active { transform: translateY(1px) scale(0.99); }
      .oc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .oc-btn.primary { background: var(--accent); color: var(--white); }
      .oc-btn.primary:hover:not(:disabled) { filter: brightness(1.08); }
      .oc-btn.secondary { background: var(--sage); color: var(--white); }
      .oc-btn.secondary:hover:not(:disabled) { filter: brightness(1.08); }
      .oc-btn.ghost {
        background: transparent; color: var(--ink);
        border: 1.5px dashed var(--ink-soft);
      }
      .oc-btn.danger { background: var(--danger); color: var(--white); }
      .oc-btn.small { width: auto; padding: 8px 14px; font-size: 0.85rem; }

      .oc-row { display: flex; gap: 10px; }
      .oc-row > * { flex: 1; }

      .oc-field { margin-bottom: 14px; }
      .oc-label {
        display: block; font-size: 0.8rem; font-weight: 600;
        color: var(--ink-soft); margin-bottom: 5px;
        letter-spacing: 0.02em;
      }
      .oc-input, .oc-textarea {
        width: 100%; font-family: var(--font-body); font-size: 0.95rem;
        padding: 10px 12px; border-radius: 8px;
        border: 1.5px solid var(--paper-edge);
        background: var(--white); color: var(--ink);
      }
      .oc-input:focus, .oc-textarea:focus {
        outline: 2px solid var(--accent-soft); border-color: var(--accent);
      }
      .oc-textarea { resize: vertical; min-height: 60px; }

      .oc-tag {
        display: inline-block;
        font-size: 0.78rem;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--paper-edge);
        color: var(--ink);
        margin: 3px 5px 3px 0;
      }
      .oc-tag.match {
        background: var(--highlight);
        font-weight: 700;
        box-shadow: 0 0 0 1.5px var(--accent);
      }

      .oc-person {
        background: var(--white);
        border: 1px solid var(--paper-edge);
        border-radius: var(--radius);
        padding: 14px;
        margin-bottom: 12px;
        cursor: pointer;
        display: flex; gap: 12px; align-items: flex-start;
        transition: box-shadow 0.15s ease, transform 0.1s ease;
      }
      .oc-person:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateY(-1px); }

      .oc-avatar {
        width: 46px; height: 46px; border-radius: 50%;
        object-fit: cover; flex-shrink: 0;
        border: 2px solid var(--paper-edge);
      }
      .oc-avatar.fallback {
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
        color: var(--white);
      }

      .oc-sortbar { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
      .oc-chip {
        font-size: 0.78rem; padding: 6px 12px; border-radius: 999px;
        background: var(--white); border: 1px solid var(--paper-edge);
        cursor: pointer; color: var(--ink-soft);
      }
      .oc-chip.active { background: var(--ink); color: var(--white); border-color: var(--ink); }

      .oc-topbar {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 14px;
      }
      .oc-code-badge {
        font-family: var(--font-display); font-weight: 700; font-size: 1.1rem;
        background: var(--highlight); padding: 2px 10px; border-radius: 6px;
        letter-spacing: 0.05em;
      }

      .oc-chat-window {
        background: var(--white);
        border-radius: var(--radius);
        border: 1px solid var(--paper-edge);
        height: 360px;
        overflow-y: auto;
        padding: 14px;
        display: flex; flex-direction: column; gap: 8px;
        margin-bottom: 12px;
      }
      .oc-bubble {
        max-width: 78%;
        padding: 8px 12px;
        border-radius: 14px;
        font-size: 0.92rem;
        line-height: 1.35;
      }
      .oc-bubble.mine {
        align-self: flex-end;
        background: var(--accent);
        color: var(--white);
        border-bottom-right-radius: 4px;
      }
      .oc-bubble.theirs {
        align-self: flex-start;
        background: var(--paper);
        color: var(--ink);
        border-bottom-left-radius: 4px;
      }
      .oc-empty {
        text-align: center; color: var(--ink-soft); font-size: 0.85rem;
        margin: auto;
      }

      .oc-wordcount {
        font-size: 0.75rem; color: var(--ink-soft); text-align: right;
        margin-top: -8px; margin-bottom: 10px;
      }
      .oc-wordcount.over { color: var(--danger); font-weight: 700; }

      .oc-link-btn {
        background: none; border: none; color: var(--ink-soft);
        text-decoration: underline; cursor: pointer; font-size: 0.85rem;
        padding: 0;
      }

      .oc-swatch {
        width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
        border: 2px solid transparent;
      }
      .oc-swatch.selected { border-color: var(--ink); }

      .oc-error {
        background: #F6DCD3; color: var(--danger); border-radius: 8px;
        padding: 8px 12px; font-size: 0.85rem; margin-bottom: 12px;
      }
    `}</style>
  );
}

/* =========================================================================
   HELPERS
   ========================================================================= */
const BG_SWATCHES = ["#E7B27A", "#7C9885", "#B5651D", "#5B6A70", "#F2C14E", "#26333A"];

function genCode(len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function genId() {
  return "u" + Math.random().toString(36).slice(2, 10);
}

function splitInterests(raw) {
  return Array.from(
    new Set(
      raw
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\s+/g, " "))
    )
  ).slice(0, 20);
}

function wordCount(text) {
  const t = text.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

function pairKey(a, b) {
  return [a, b].sort().join("__");
}

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

async function fileToResizedDataUrl(file, maxSize = 160) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = dataUrl;
  });
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

// Storage wrappers with safe "not found" handling
async function storGet(key, shared) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? r.value : null;
  } catch {
    return null;
  }
}
async function storSet(key, value, shared) {
  try {
    await window.storage.set(key, value, shared);
    return true;
  } catch {
    return false;
  }
}

/* =========================================================================
   MAIN APP
   ========================================================================= */
export default function OfflineConnectApp() {
  const [screen, setScreen] = useState("rules"); // rules | groupChoice | profile | menu | chat
  const [groupCode, setGroupCode] = useState(null);
  const [myId, setMyId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [activePartner, setActivePartner] = useState(null); // {id, profile}
  const [error, setError] = useState("");

  // Restore last session (per-user, non-shared)
  useEffect(() => {
    (async () => {
      const raw = await storGet("session", false);
      if (raw) {
        try {
          const s = JSON.parse(raw);
          if (s.groupCode && s.myId) {
            const profRaw = await storGet(`profile:${s.groupCode}:${s.myId}`, true);
            if (profRaw) {
              setGroupCode(s.groupCode);
              setMyId(s.myId);
              setMyProfile(JSON.parse(profRaw));
              setScreen("menu");
            }
          }
        } catch {}
      }
    })();
  }, []);

  const saveSession = useCallback(async (code, id) => {
    await storSet("session", JSON.stringify({ groupCode: code, myId: id }), false);
  }, []);

  const leaveGroup = async () => {
    await storSet("session", JSON.stringify({}), false);
    setGroupCode(null);
    setMyId(null);
    setMyProfile(null);
    setActivePartner(null);
    setScreen("rules");
  };

  return (
    <div className="oc-root">
      <GlobalStyles />
      <div className="oc-shell">
        {screen === "rules" && <RulesScreen onNext={() => setScreen("groupChoice")} />}

        {screen === "groupChoice" && (
          <GroupChoiceScreen
            setError={setError}
            error={error}
            onCreate={async () => {
              const code = genCode(CONFIG.GROUP_CODE_LENGTH);
              await storSet(`group:${code}:members`, JSON.stringify([]), true);
              setGroupCode(code);
              setScreen("profile");
            }}
            onJoin={async (code) => {
              const upper = code.trim().toUpperCase();
              const membersRaw = await storGet(`group:${upper}:members`, true);
              if (membersRaw === null) {
                setError("That group code wasn't found. Double-check it and try again.");
                return;
              }
              setError("");
              setGroupCode(upper);
              setScreen("profile");
            }}
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            onDone={async (profile) => {
              const id = genId();
              await storSet(`profile:${groupCode}:${id}`, JSON.stringify(profile), true);
              const membersRaw = await storGet(`group:${groupCode}:members`, true);
              const members = membersRaw ? JSON.parse(membersRaw) : [];
              members.push(id);
              await storSet(`group:${groupCode}:members`, JSON.stringify(members), true);
              setMyId(id);
              setMyProfile(profile);
              await saveSession(groupCode, id);
              setScreen("menu");
            }}
          />
        )}

        {screen === "menu" && myProfile && (
          <MenuScreen
            groupCode={groupCode}
            myId={myId}
            myProfile={myProfile}
            onOpenChat={(partner) => {
              setActivePartner(partner);
              setScreen("chat");
            }}
            onLeave={leaveGroup}
          />
        )}

        {screen === "chat" && activePartner && (
          <ChatScreen
            groupCode={groupCode}
            myId={myId}
            myProfile={myProfile}
            partner={activePartner}
            onBack={() => setScreen("menu")}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   SCREEN: Rules
   ========================================================================= */
function RulesScreen({ onNext }) {
  return (
    <div>
      <div className="oc-card">
        <span className="oc-pin" />
        <h1 className="oc-h1">Look Up</h1>
        <p className="oc-sub">
          A tiny experiment in meeting the people already around you — the ones
          in your lecture hall, your dorm hallway, your favorite café.
        </p>
        <h2 className="oc-h2" style={{ fontSize: "1.2rem" }}>
          How it works
        </h2>
        <ul style={{ color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6, paddingLeft: "18px" }}>
          <li>Join a group with a shared code (your class, event, or floor).</li>
          <li>Make a quick profile: name, photo, color, and your interests.</li>
          <li>Browse who else is in the group and what you have in common.</li>
          <li>
            Send a <strong>short</strong> message — every message is capped at{" "}
            {CONFIG.MAX_WORDS_PER_MESSAGE} words. Enough to say "hey, coffee?", not enough
            to carry a whole conversation.
          </li>
          <li>The rest of the conversation happens in person. That's the point.</li>
        </ul>
      </div>
      <button className="oc-btn primary" onClick={onNext}>
        I'm in — let's set up
      </button>
    </div>
  );
}

/* =========================================================================
   SCREEN: Create or Join Group
   ========================================================================= */
function GroupChoiceScreen({ onCreate, onJoin, error, setError }) {
  const [mode, setMode] = useState(null); // null | 'join'
  const [codeInput, setCodeInput] = useState("");

  return (
    <div>
      <div className="oc-card">
        <span className="oc-pin" />
        <h2 className="oc-h2">Find your people</h2>
        <p className="oc-sub">Create a new group, or join one with a code someone shared with you.</p>

        {error && <div className="oc-error">{error}</div>}

        {mode !== "join" && (
          <div className="oc-row" style={{ marginBottom: mode === "join" ? 0 : "12px" }}>
            <button className="oc-btn primary" onClick={onCreate}>
              Create group
            </button>
            <button className="oc-btn ghost" onClick={() => { setError(""); setMode("join"); }}>
              Join group
            </button>
          </div>
        )}

        {mode === "join" && (
          <div>
            <div className="oc-field">
              <label className="oc-label">Group code</label>
              <input
                className="oc-input"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. 7XQPL"
                maxLength={10}
                autoFocus
              />
            </div>
            <div className="oc-row">
              <button
                className="oc-btn primary"
                disabled={!codeInput.trim()}
                onClick={() => onJoin(codeInput)}
              >
                Join
              </button>
              <button className="oc-btn ghost" onClick={() => { setError(""); setMode(null); }}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   SCREEN: Profile Setup
   ========================================================================= */
function ProfileScreen({ onDone }) {
  const [name, setName] = useState("");
  const [pic, setPic] = useState(null);
  const [bgColor, setBgColor] = useState(BG_SWATCHES[0]);
  const [interestsRaw, setInterestsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const interests = splitInterests(interestsRaw);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPic(dataUrl);
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = name.trim().length > 0;

  return (
    <div>
      <div className="oc-card">
        <span className="oc-pin" />
        <h2 className="oc-h2">Set up your profile</h2>
        <p className="oc-sub">This is what nearby group members will see.</p>

        <div className="oc-field">
          <label className="oc-label">Name</label>
          <input
            className="oc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should people call you?"
            maxLength={30}
          />
        </div>

        <div className="oc-field">
          <label className="oc-label">Profile picture (optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pic ? (
              <img src={pic} className="oc-avatar" alt="preview" style={{ width: 54, height: 54 }} />
            ) : (
              <div
                className="oc-avatar fallback"
                style={{ width: 54, height: 54, background: bgColor }}
              >
                {initials(name)}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ fontSize: "0.8rem" }} />
          </div>
          {busy && <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>Processing image…</p>}
        </div>

        <div className="oc-field">
          <label className="oc-label">Background color</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {BG_SWATCHES.map((sw) => (
              <div
                key={sw}
                className={"oc-swatch" + (bgColor === sw ? " selected" : "")}
                style={{ background: sw }}
                onClick={() => setBgColor(sw)}
              />
            ))}
          </div>
        </div>

        <div className="oc-field">
          <label className="oc-label">Your interests</label>
          <textarea
            className="oc-textarea"
            value={interestsRaw}
            onChange={(e) => setInterestsRaw(e.target.value)}
            placeholder="Separate with commas — e.g. rock climbing, film photography, jazz, ramen"
          />
          <div style={{ marginTop: "8px" }}>
            {interests.map((tag) => (
              <span key={tag} className="oc-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <button
        className="oc-btn primary"
        disabled={!canSubmit}
        onClick={() => onDone({ name: name.trim(), pic, bgColor, interests })}
      >
        Enter the group
      </button>
    </div>
  );
}

/* =========================================================================
   SCREEN: Menu (nearby / in-group people list)
   ========================================================================= */
function MenuScreen({ groupCode, myId, myProfile, onOpenChat, onLeave }) {
  const [people, setPeople] = useState([]); // [{id, profile, matchCount}]
  const [sortMode, setSortMode] = useState("matches-desc"); // matches-desc|matches-asc|name-asc|name-desc
  const [loading, setLoading] = useState(true);

  const myTags = new Set((myProfile.interests || []).map((t) => t.toLowerCase()));

  const refresh = useCallback(async () => {
    const membersRaw = await storGet(`group:${groupCode}:members`, true);
    const members = membersRaw ? JSON.parse(membersRaw) : [];
    const others = members.filter((id) => id !== myId);
    const loaded = await Promise.all(
      others.map(async (id) => {
        const raw = await storGet(`profile:${groupCode}:${id}`, true);
        if (!raw) return null;
        const profile = JSON.parse(raw);
        const matchCount = (profile.interests || []).filter((t) =>
          myTags.has(t.toLowerCase())
        ).length;
        return { id, profile, matchCount };
      })
    );
    setPeople(loaded.filter(Boolean));
    setLoading(false);
  }, [groupCode, myId, myProfile]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [refresh]);

  const sorted = [...people].sort((a, b) => {
    switch (sortMode) {
      case "matches-desc": return b.matchCount - a.matchCount;
      case "matches-asc": return a.matchCount - b.matchCount;
      case "name-asc": return a.profile.name.localeCompare(b.profile.name);
      case "name-desc": return b.profile.name.localeCompare(a.profile.name);
      default: return 0;
    }
  });

  return (
    <div>
      <div className="oc-topbar">
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>Group</div>
          <span className="oc-code-badge">{groupCode}</span>
        </div>
        <button className="oc-link-btn" onClick={onLeave}>Leave group</button>
      </div>

      <div className="oc-card flat" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {myProfile.pic ? (
          <img src={myProfile.pic} className="oc-avatar" alt="me" />
        ) : (
          <div className="oc-avatar fallback" style={{ background: myProfile.bgColor }}>
            {initials(myProfile.name)}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700 }}>{myProfile.name}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>
            {(myProfile.interests || []).length} interests · that's you
          </div>
        </div>
      </div>

      <h2 className="oc-h2">Who's here</h2>

      <div className="oc-sortbar">
        <SortChip label="Most in common" active={sortMode === "matches-desc"} onClick={() => setSortMode("matches-desc")} />
        <SortChip label="Least in common" active={sortMode === "matches-asc"} onClick={() => setSortMode("matches-asc")} />
        <SortChip label="Name A–Z" active={sortMode === "name-asc"} onClick={() => setSortMode("name-asc")} />
        <SortChip label="Name Z–A" active={sortMode === "name-desc"} onClick={() => setSortMode("name-desc")} />
      </div>

      {loading && <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Looking for people…</p>}
      {!loading && sorted.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
          Nobody else has joined yet — share the code <strong>{groupCode}</strong>.
        </p>
      )}

      {sorted.map((p) => (
        <div key={p.id} className="oc-person" onClick={() => onOpenChat(p)}>
          {p.profile.pic ? (
            <img src={p.profile.pic} className="oc-avatar" alt={p.profile.name} />
          ) : (
            <div className="oc-avatar fallback" style={{ background: p.profile.bgColor }}>
              {initials(p.profile.name)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{p.profile.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
              {p.matchCount} interest{p.matchCount === 1 ? "" : "s"} in common
            </div>
            <div>
              {(p.profile.interests || []).map((tag) => (
                <span
                  key={tag}
                  className={"oc-tag" + (myTags.has(tag.toLowerCase()) ? " match" : "")}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SortChip({ label, active, onClick }) {
  return (
    <button className={"oc-chip" + (active ? " active" : "")} onClick={onClick}>
      {label}
    </button>
  );
}

/* =========================================================================
   SCREEN: Chat
   ========================================================================= */
function ChatScreen({ groupCode, myId, myProfile, partner, onBack }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const key = `chat:${groupCode}:${pairKey(myId, partner.id)}`;

  const refresh = useCallback(async () => {
    const raw = await storGet(key, true);
    setMessages(raw ? JSON.parse(raw) : []);
  }, [key]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [refresh]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const words = wordCount(draft);
  const overLimit = words > CONFIG.MAX_WORDS_PER_MESSAGE;

  const send = async () => {
    const text = draft.trim();
    if (!text || overLimit) return;
    const raw = await storGet(key, true);
    const current = raw ? JSON.parse(raw) : [];
    const updated = [...current, { from: myId, text, ts: Date.now() }];
    await storSet(key, JSON.stringify(updated), true);
    setMessages(updated);
    setDraft("");
  };

  return (
    <div>
      <div className="oc-topbar">
        <button className="oc-link-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="oc-card flat" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {partner.profile.pic ? (
          <img src={partner.profile.pic} className="oc-avatar" alt={partner.profile.name} />
        ) : (
          <div className="oc-avatar fallback" style={{ background: partner.profile.bgColor }}>
            {initials(partner.profile.name)}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700 }}>{partner.profile.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>
            {CONFIG.MAX_WORDS_PER_MESSAGE} words max per message — say enough to meet up.
          </div>
        </div>
      </div>

      <div className="oc-chat-window" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="oc-empty">No messages yet. Break the ice — briefly.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"oc-bubble " + (m.from === myId ? "mine" : "theirs")}>
            {m.text}
          </div>
        ))}
      </div>

      <textarea
        className="oc-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type a short message…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className={"oc-wordcount" + (overLimit ? " over" : "")}>
        {words} / {CONFIG.MAX_WORDS_PER_MESSAGE} words
      </div>
      <button className="oc-btn primary" disabled={!draft.trim() || overLimit} onClick={send}>
        Send
      </button>
    </div>
  );
}