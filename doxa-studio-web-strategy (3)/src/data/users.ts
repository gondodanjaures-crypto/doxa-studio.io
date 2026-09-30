import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Base de données des comptes (stockage local, RBAC 3 rôles)           */
/* ------------------------------------------------------------------ */
/* rôles :                                                               */
/*  - super   : tout accès (crée, supprime, gère tous les rôles)         */
/*  - manager : change images/textes, crée des comptes (éditeurs),       */
/*              ne supprime pas de comptes, ne donne pas les rôles       */
/*              manager / super admin                                    */
/*  - editor  : change images et textes du site, rien d'autre            */
/* ------------------------------------------------------------------ */

export type Role = "super" | "manager" | "editor";

export type Account = {
  id: string;
  pseudo: string;
  email: string;
  pass: string | null; // null = mot de passe non encore créé (première ouverture)
  recoveryEmail: string; // email de récupération
  role: Role;
  createdAt: number;
  system?: boolean; // compte fondamental, protégé
};

const USERS_KEY = "doxa.users.v1";
const SESSION_KEY = "doxa.account.v1";

/* Hachage simple (démo — non destiné à une vraie sécurité web). */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36);
}

const SEED: Account[] = [
  {
    id: "root",
    pseudo: "Admin/Jaures",
    email: "gondodanjaures@gmail.com",
    pass: null, // créé par l'utilisateur à la première ouverture
    recoveryEmail: "gondodanjaures@gmail.com",
    role: "super",
    createdAt: 0,
    system: true,
  },
  {
    id: "team",
    pseudo: "Équipe Doxa",
    email: "equipe@doxastudio.com",
    pass: hash("doxa2026"),
    recoveryEmail: "equipe@doxastudio.com",
    role: "manager",
    createdAt: 0,
  },
];

function load(): Account[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return SEED;
    const p = JSON.parse(raw);
    return Array.isArray(p) && p.length > 0 ? (p as Account[]) : SEED;
  } catch {
    return SEED;
  }
}

let users: Account[] = load();
let sessionId: string | null = null;
try {
  sessionId = localStorage.getItem(SESSION_KEY);
} catch {
  sessionId = null;
}
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* stockage indisponible */
  }
  emit();
}

/* ------------------------------ Lecture ---------------------------- */
export function getUsers(): Account[] {
  return users;
}
export function getAccount(id: string): Account | null {
  return users.find((u) => u.id === id) ?? null;
}
export function getSessionAccount(): Account | null {
  return sessionId ? getAccount(sessionId) : null;
}

/* ------------------------------ Actions ---------------------------- */
export function login(
  email: string,
  password: string,
): Account | null {
  const u = users.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!u || !u.pass || u.pass !== hash(password)) return null;
  sessionId = u.id;
  try {
    localStorage.setItem(SESSION_KEY, u.id);
  } catch {
    /* ignore */
  }
  emit();
  return u;
}

/* ----------------- Première ouverture / récupération ----------------- */

/** Le compte fondateur attend-il la création de son mot de passe ? */
export function needsSetup(): boolean {
  const root = users.find((u) => u.system);
  return !!root && root.pass === null;
}

/** À la première ouverture : crée le mot de passe du compte Admin/Jaures. */
export function setupRootPassword(
  recoveryEmail: string,
  password: string,
): { ok: true; account: Account } | { ok: false; error: string } {
  const root = users.find((u) => u.system);
  if (!root) return { ok: false, error: "Compte fondateur introuvable." };
  if (root.pass !== null)
    return { ok: false, error: "L'administration est déjà initialisée." };
  if (root.recoveryEmail !== recoveryEmail.trim().toLowerCase())
    return {
      ok: false,
      error: "Cette adresse n'est pas l'email de récupération du compte fondateur.",
    };
  if (password.length < 8)
    return { ok: false, error: "Mot de passe : 8 caractères minimum." };
  users = users.map((x) =>
    x.id === root.id ? { ...x, pass: hash(password) } : x,
  );
  persist();
  return { ok: true, account: getAccount(root.id)! };
}

/** Recherche d'un compte par son email de récupération. */
export function findRecoveryAccount(email: string): Account | null {
  const e = email.trim().toLowerCase();
  return (
    users.find((a) => (a.recoveryEmail ?? a.email).toLowerCase() === e) ?? null
  );
}

/** Réinitialisation du mot de passe via l'email de récupération. */
export function resetPassword(
  recoveryEmail: string,
  password: string,
): { ok: true; account: Account } | { ok: false; error: string } {
  const u = findRecoveryAccount(recoveryEmail);
  if (!u)
    return {
      ok: false,
      error: "Aucun compte n'est associé à cette adresse de récupération.",
    };
  if (password.length < 8)
    return { ok: false, error: "Mot de passe : 8 caractères minimum." };
  users = users.map((x) =>
    x.id === u.id ? { ...x, pass: hash(password) } : x,
  );
  persist();
  return { ok: true, account: getAccount(u.id)! };
}

export function logout() {
  sessionId = null;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function createAccount(
  pseudo: string,
  email: string,
  password: string,
  role: Role,
): { ok: true; account: Account } | { ok: false; error: string } {
  if (!pseudo.trim()) return { ok: false, error: "Le pseudo est requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { ok: false, error: "Adresse email invalide." };
  if (password.length < 6)
    return { ok: false, error: "Mot de passe : 6 caractères minimum." };
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
    return { ok: false, error: "Cet email est déjà utilisé par un compte." };
  const account: Account = {
    id: "u" + Date.now().toString(36),
    pseudo: pseudo.trim(),
    email: email.trim().toLowerCase(),
    pass: hash(password),
    recoveryEmail: email.trim().toLowerCase(),
    role,
    createdAt: Date.now(),
  };
  users = [...users, account];
  persist();
  return { ok: true, account };
}

export function deleteAccount(id: string): boolean {
  const u = getAccount(id);
  if (!u || u.system) return false;
  users = users.filter((x) => x.id !== id);
  if (sessionId === id) logout();
  persist();
  return true;
}

export function setAccountRole(id: string, role: Role): boolean {
  const u = getAccount(id);
  if (!u || u.system) return false;
  users = users.map((x) => (x.id === id ? { ...x, role } : x));
  persist();
  return true;
}

/* --------------------------- Permissions --------------------------- */
export const ROLE_LABELS: Record<Role, string> = {
  super: "Super Admin",
  manager: "Manager",
  editor: "Éditeur",
};

export const ROLE_DESC: Record<Role, string> = {
  super: "Tout accès : contenu, comptes, rôles, suppression.",
  manager: "Images & textes, création de comptes éditeurs, pas de suppression de comptes.",
  editor: "Change les images et les textes du site.",
};

export const canManageAccounts = (r: Role) => r === "super" || r === "manager";
export const canDeleteAccounts = (r: Role) => r === "super";
export const canVisibility = (r: Role) => r !== "editor";
export const canDangerZone = (r: Role) => r === "super";

/** Rôles qu'un compte peut attribuer à d'autres. */
export const assignableRoles = (r: Role): Role[] =>
  r === "super"
    ? ["super", "manager", "editor"]
    : r === "manager"
      ? ["editor"]
      : [];

/* --------------------------- Export / import ------------------------ */
export function exportUsers(): string {
  return JSON.stringify(users);
}

export function importUsers(json: string): boolean {
  try {
    const p = JSON.parse(json);
    if (!Array.isArray(p) || p.length === 0) return false;
    users = p as Account[];
    persist();
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ Hooks ------------------------------ */
export function subscribeUsers(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useUsers(): Account[] {
  return useSyncExternalStore(subscribeUsers, getUsers);
}

export function useSession(): Account | null {
  return useSyncExternalStore(subscribeUsers, getSessionAccount);
}
