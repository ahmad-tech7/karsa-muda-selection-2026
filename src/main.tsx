import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  Eye,
  Home,
  LogOut,
  Menu,
  Megaphone,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { supabase } from "./supabase";
import type {
  Announcement,
  Participant,
  SelectionStage,
  Status,
} from "./types";

import "./styles.css";

const statusMeta: Record<
  Status,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  BELUM_DIUMUMKAN: {
    label: "BELUM DIUMUMKAN",
    color: "gray",
    icon: <Clock3 />,
  },

  LOLOS: {
    label: "LOLOS",
    color: "green",
    icon: <CheckCircle2 />,
  },

  TIDAK_LOLOS: {
    label: "TIDAK LOLOS",
    color: "red",
    icon: <XCircle />,
  },

  DAFTAR_TUNGGU: {
    label: "DAFTAR TUNGGU",
    color: "yellow",
    icon: <Clock3 />,
  },

  LOLOS_TAHAP_BERIKUTNYA: {
    label: "LOLOS TAHAP BERIKUTNYA",
    color: "blue",
    icon: <CheckCircle2 />,
  },

  FINALIS: {
    label: "FINALIS",
    color: "purple",
    icon: <ShieldCheck />,
  },

  TERPILIH: {
    label: "TERPILIH",
    color: "green",
    icon: <ShieldCheck />,
  },

  TIDAK_TERPILIH: {
    label: "TIDAK TERPILIH",
    color: "red",
    icon: <XCircle />,
  },
};

function PublicNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          KARSA MUDA{" "}
          <span className="brand-accent">2026</span>
        </Link>

        <div className="navlinks">
          <Link to="/">Home</Link>
          <Link to="/hasil">Cek Hasil</Link>
          <Link to="/timeline">Timeline</Link>
          <Link to="/pengumuman">Pengumuman</Link>
          <Link to="/admin/login">Admin</Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <strong>KARSA MUDA SELECTION 2026</strong>

        <p>
          Official Selection Result Portal
          <br />
          © 2026
        </p>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <PublicNav />

      <main className="container">
        <section className="hero">
          <div className="eyebrow">
            OFFICIAL SELECTION RESULT
          </div>

          <h1>
            KARSA MUDA
            <br />
            SELECTION 2026
          </h1>

          <p>
            Portal resmi hasil seleksi calon pengurus OSIS
            periode 2026/2027. Temukan hasil perjalananmu
            menggunakan nomor peserta.
          </p>

          <Link
            className="btn primary"
            to="/hasil"
          >
            <Search size={18} />
            CEK HASIL SELEKSI
          </Link>
        </section>

        <section className="section">
          <div className="grid grid3">
            <div className="card">
              <ShieldCheck />

              <h3>Resmi</h3>

              <p className="muted">
                Hasil dipublikasikan langsung oleh panitia.
              </p>
            </div>

            <div className="card">
              <Clock3 />

              <h3>Real-time</h3>

              <p className="muted">
                Hasil muncul setelah admin melakukan publikasi.
              </p>
            </div>

            <div className="card">
              <Users />

              <h3>84 Peserta</h3>

              <p className="muted">
                Data peserta berdasarkan nomor peserta dan kelas.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function defaultMessage(status: Status) {
  if (status === "LOLOS_TAHAP_BERIKUTNYA") {
    return "Selamat! Kamu berhasil lolos ke tahap seleksi berikutnya. Tetap semangat dan persiapkan dirimu dengan baik.";
  }

  if (status === "LOLOS" || status === "TERPILIH") {
    return "Selamat! Terima kasih telah memberikan yang terbaik dalam proses seleksi.";
  }

  if (
    status === "TIDAK_LOLOS" ||
    status === "TIDAK_TERPILIH"
  ) {
    return "Terima kasih telah berani mencoba, berproses, dan memberikan yang terbaik.";
  }

  if (status === "DAFTAR_TUNGGU") {
    return "Perjalananmu belum berakhir. Tetap pantau informasi resmi Karsa Muda Selection 2026.";
  }

  return "Silakan kembali setelah hasil resmi dipublikasikan.";
}

function ResultCard({
  participant,
}: {
  participant: Participant;
}) {
  const meta = statusMeta[participant.status];

  return (
    <div className="card result-card">
      <div className="result-header">
        <div className={`status-icon ${meta.color}`}>
          {meta.icon}
        </div>

        <div>
          <div className="result-title">
            {meta.label}
          </div>

          <div className="muted">
            Karsa Muda Selection 2026
          </div>
        </div>
      </div>

      <div className="details">
        <div className="detail">
          <small>Nama</small>
          <strong>{participant.name}</strong>
        </div>

        <div className="detail">
          <small>Nomor Peserta</small>
          <strong>
            {participant.participant_number}
          </strong>
        </div>

        <div className="detail">
          <small>Kelas</small>
          <strong>{participant.class}</strong>
        </div>

        <div className="detail">
          <small>Status</small>
          <strong>{meta.label}</strong>
        </div>
      </div>

      <div className="notice">
        {participant.message ||
          defaultMessage(participant.status)}
      </div>
    </div>
  );
}

function CheckResult() {
  const [number, setNumber] = useState("");
  const [participant, setParticipant] =
    useState<Participant | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchParticipant() {
    if (!number.trim()) {
      setError("Masukkan nomor peserta terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setParticipant(null);

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq(
        "participant_number",
        number.trim().toUpperCase()
      )
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      setError(
        "Terjadi kesalahan saat mengambil data."
      );
    } else if (!data) {
      setError(
        "Nomor peserta tidak ditemukan atau hasil belum dipublikasikan."
      );
    } else {
      setParticipant(data as Participant);
    }

    setLoading(false);
  }

  return (
    <>
      <PublicNav />

      <main className="container section">
        <div className="center">
          <div className="eyebrow">
            RESULT PORTAL
          </div>

          <h2>Cek Hasil Seleksi</h2>

          <p className="muted">
            Masukkan nomor peserta untuk melihat hasil resmi.
          </p>
        </div>

        <div className="card searchbox">
          <div className="form">
            <label className="label">
              NOMOR PESERTA
            </label>

            <input
              className="input"
              value={number}
              onChange={(event) =>
                setNumber(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchParticipant();
                }
              }}
              placeholder="Contoh: KM26-001"
            />

            <button
              className="btn primary"
              onClick={searchParticipant}
              disabled={loading}
            >
              {loading
                ? "MEMERIKSA..."
                : "CEK HASIL"}
            </button>

            {error && (
              <div className="error">
                {error}
              </div>
            )}
          </div>

          {participant && (
            <ResultCard participant={participant} />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function Timeline() {
  const [stages, setStages] = useState<
    SelectionStage[]
  >([]);

  useEffect(() => {
    supabase
      .from("selection_stages")
      .select("*")
      .order("order_number")
      .then(({ data }) => {
        setStages(
          (data || []) as SelectionStage[]
        );
      });
  }, []);

  return (
    <>
      <PublicNav />

      <main className="container section">
        <div className="eyebrow">
          ROADMAP
        </div>

        <h2>Timeline Seleksi</h2>

        <p className="muted">
          Tahapan Karsa Muda Selection 2026.
        </p>

        <div
          className="card timeline"
          style={{ marginTop: 25 }}
        >
          {stages.map((stage, index) => (
            <div
              className="timeline-item"
              key={stage.id}
            >
              <div
                className={`dot ${
                  stage.status === "BERLANGSUNG"
                    ? "active"
                    : ""
                }`}
              />

              <div>
                <strong>
                  {String(index + 1).padStart(2, "0")} —{" "}
                  {stage.name.toUpperCase()}
                </strong>

                <p className="muted">
                  {stage.description}
                </p>

                <span
                  className={`badge ${
                    stage.status === "SELESAI"
                      ? "green"
                      : stage.status ===
                        "BERLANGSUNG"
                      ? "blue"
                      : "gray"
                  }`}
                >
                  {stage.status}
                </span>
              </div>
            </div>
          ))}

          {stages.length === 0 && (
            <div className="muted">
              Timeline belum tersedia.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function Announcements() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("published_at", {
        ascending: false,
      })
      .then(({ data }) => {
        setAnnouncements(
          (data || []) as Announcement[]
        );
      });
  }, []);

  return (
    <>
      <PublicNav />

      <main className="container section">
        <div className="eyebrow">
          OFFICIAL INFORMATION
        </div>

        <h2>Pengumuman</h2>

        <div
          className="grid"
          style={{ marginTop: 25 }}
        >
          {announcements.map((announcement) => (
            <article
              className="card"
              key={announcement.id}
            >
              <small className="muted">
                {announcement.published_at
                  ? new Date(
                      announcement.published_at
                    ).toLocaleString("id-ID")
                  : ""}
              </small>

              <h3>{announcement.title}</h3>

              <p
                className="muted"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {announcement.content}
              </p>
            </article>
          ))}

          {announcements.length === 0 && (
            <div className="card muted">
              Belum ada pengumuman yang
              dipublikasikan.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function login(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(
        "Email atau password salah."
      );
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  }

  return (
    <div className="login app">
      <div className="card login-card">
        <div className="eyebrow">
          KARSA MUDA 2026
        </div>

        <h2>Admin Panel</h2>

        <p className="muted">
          Masuk untuk mengelola hasil seleksi.
        </p>

        <form
          className="form"
          onSubmit={login}
        >
          <label className="label">
            EMAIL
          </label>

          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label className="label">
            PASSWORD
          </label>

          <div className="password-row">
            <input
              className="input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />

            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? "Sembunyikan"
                : "Lihat"}
            </button>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="btn primary"
            disabled={loading}
          >
            {loading
              ? "LOGIN..."
              : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

async function getAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("admin_profiles")
    .select(
      "user_id,email,display_name,role"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<
    "loading" | "ok" | "no"
  >("loading");

  useEffect(() => {
    getAdmin().then((admin) => {
      setState(admin ? "ok" : "no");
    });
  }, []);

  if (state === "loading") {
    return (
      <div className="login app">
        Memuat...
      </div>
    );
  }

  if (state === "no") {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <>{children}</>;
}

function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  async function logout() {
    await supabase.auth.signOut();

    navigate("/admin/login");
  }

  const links = [
    ["/admin/dashboard", "Dashboard", Home],
    ["/admin/peserta", "Peserta", Users],
    [
      "/admin/pengumuman",
      "Pengumuman",
      Megaphone,
    ],
    [
      "/admin/timeline",
      "Timeline",
      Clock3,
    ],
  ] as const;

  return (
    <div className="admin-shell app">
      <aside
        className={`sidebar ${
          menuOpen ? "open" : ""
        }`}
      >
        <div className="brand">
          KARSA MUDA
          <br />
          <span className="brand-accent">
            ADMIN
          </span>
        </div>

        <div className="side-menu">
          {links.map(
            ([path, label, Icon]) => (
              <Link
                key={path}
                className={
                  location.pathname === path
                    ? "active"
                    : ""
                }
                to={path}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          )}

          <button onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <button
          className="btn ghost mobile-menu"
          onClick={() =>
            setMenuOpen(true)
          }
        >
          <Menu />
          Menu
        </button>

        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [admin, setAdmin] =
    useState<any>(null);

  async function load() {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("participant_number");

    setParticipants(
      (data || []) as Participant[]
    );
  }

  useEffect(() => {
    load();

    getAdmin().then(setAdmin);
  }, []);

  const counts = useMemo(() => {
    return Object.fromEntries(
      Object.keys(statusMeta).map(
        (status) => [
          status,
          participants.filter(
            (participant) =>
              participant.status ===
              status
          ).length,
        ]
      )
    );
  }, [participants]);

  return (
    <AdminShell>
      <div className="topbar">
        <div>
          <div className="eyebrow">
            ADMIN DASHBOARD
          </div>

          <h2>
            Ringkasan Seleksi
          </h2>
        </div>

        <div className="muted">
          {admin?.email}
        </div>
      </div>

      <div className="stats">
        <div className="card stat">
          <span className="muted">
            TOTAL
          </span>

          <b>
            {participants.length}
          </b>
        </div>

        <div className="card stat">
          <span className="muted">
            LOLOS
          </span>

          <b className="green-text">
            {counts.LOLOS}
          </b>
        </div>

        <div className="card stat">
          <span className="muted">
            TIDAK LOLOS
          </span>

          <b className="red-text">
            {counts.TIDAK_LOLOS}
          </b>
        </div>

        <div className="card stat">
          <span className="muted">
            DAFTAR TUNGGU
          </span>

          <b className="yellow-text">
            {counts.DAFTAR_TUNGGU}
          </b>
        </div>

        <div className="card stat">
          <span className="muted">
            FINALIS
          </span>

          <b>
            {counts.FINALIS}
          </b>
        </div>

        <div className="card stat">
          <span className="muted">
            BELUM
          </span>

          <b>
            {counts.BELUM_DIUMUMKAN}
          </b>
        </div>
      </div>

      <section className="section">
        <div className="card">
          <h3>
            Alur kerja admin
          </h3>

          <p className="muted">
            Buka menu Peserta → pilih
            peserta → pilih status →
            simpan sebagai draft atau
            publish hasil.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}

function ParticipantsAdmin() {
  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [editing, setEditing] =
    useState<Participant | null>(null);

  const [
