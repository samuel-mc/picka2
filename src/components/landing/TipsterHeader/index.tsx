import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Bell, Bookmark, ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { getDefaultAppPath } from '@/lib/auth';
import logo from "../../../assets/logo.png";
import './styles.css';
import { useLogin } from '@/hooks/useLogin';
import { useAuthStore } from '@/stores/authStore';
import { useApi } from '@/hooks/useApi';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TipsterHeaderProps {
  isFixed?: boolean;
}

interface HeaderProfile {
  name: string;
  lastname: string;
  username?: string | null;
  avatarUrl: string | null;
}

const TipsterHeader = ({ isFixed = true }: TipsterHeaderProps) => {
  const api = useApi();
  const navigate = useNavigate();
  const authenticated = useAuthStore((state) => state.authenticated);
  const role = useAuthStore((state) => state.role);
  const username = useAuthStore((state) => state.username);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const { items: notifications, unreadCount, loading: notificationsLoading, loadNotifications, markAsRead } =
    useNotifications();

  const {logout} = useLogin();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [authenticated, role]);

  useEffect(() => {
    if (!authenticated) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { data } = await api.get<HeaderProfile>("/me/profile");
        if (!cancelled) {
          setProfile(data);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, authenticated]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const homePath = authenticated ? getDefaultAppPath(role) : "/";
  const initials = useMemo(() => {
    const fullName = [profile?.name, profile?.lastname]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ");

    if (fullName) {
      return fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    }

    return username?.slice(0, 2).toUpperCase() ?? "PK";
  }, [profile?.lastname, profile?.name, username]);

  const openProfile = () => {
    navigate(role === "ROLE_ADMIN" ? "/admin/perfil" : "/perfil");
  };

  const openSavedPosts = () => {
    navigate("/guardados");
  };

  const handleNotificationClick = async (notificationId: number, targetPath: string) => {
    try {
      await markAsRead(notificationId);
    } finally {
      navigate(targetPath);
    }
  };

  const resolveNotificationTarget = (notification: (typeof notifications)[number]) => {
    if (notification.type === "FOLLOW_STARTED" && notification.targetUserId) {
      return `/perfil/${notification.targetUserId}`;
    }

    if (notification.postId && notification.commentId) {
      return `/posts/${notification.postId}?commentId=${notification.commentId}`;
    }

    if (notification.postId) {
      return `/posts/${notification.postId}`;
    }

    return "/feed";
  };

  const formatNotificationDate = (value: string) => {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
      return `Hace ${diffDays} d`;
    }

    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  };

  const renderNotificationsMenu = () => {
    if (!authenticated) {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={() => void loadNotifications()}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-light transition hover:bg-white/15 focus:outline-none"
          aria-label="Abrir notificaciones"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ed5f2f] px-1 text-[11px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[22rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Estás al día"}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-slate-200" />
          {notificationsLoading ? (
            <div className="px-3 py-6 text-sm text-slate-500">Cargando notificaciones...</div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-6 text-sm text-slate-500">Todavía no tienes notificaciones.</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() =>
                  void handleNotificationClick(
                    notification.id,
                    resolveNotificationTarget(notification)
                  )
                }
                className={`rounded-2xl px-3 py-3 text-slate-700 hover:bg-slate-50 ${
                  !notification.read ? "bg-[#edf5fb]" : ""
                }`}
              >
                <div className="flex w-full items-start gap-3">
                  {notification.actor.avatarUrl ? (
                    <img
                      src={notification.actor.avatarUrl}
                      alt={notification.actor.name}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f4c81] text-sm font-bold text-white">
                      {notification.actor.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span className="truncate">@{notification.actor.username}</span>
                      {notification.actor.validatedTipster && (
                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className={`${isFixed ? 'fixed top-0 left-0 right-0 z-50 ' : ''}w-full bg-primaryBlue text-light shadow-md`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="shrink-0 flex items-center">
          <Link to={homePath} onClick={closeMenu} className="flex items-center gap-2">
            <img src={logo} alt="Picka2 logo" className="w-full max-width-100 header-logo mr-2" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {renderNotificationsMenu()}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-light transition hover:bg-white/15"
            aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {authenticated ? (
            <>
              {role === 'ROLE_ADMIN' && (
                <Link 
                  to={homePath}
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Panel
                </Link>
              )}
              {renderNotificationsMenu()}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-left text-light transition hover:bg-white/15 focus:outline-none">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile?.username?.trim() ? `Perfil de ${profile.username}` : "Foto de perfil"}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-primaryBlue ring-2 ring-white/20">
                      {initials}
                    </span>
                  )}
                  <div className="hidden min-w-0 lg:block">
                    <p className="truncate text-sm font-semibold text-white">
                      {profile ? `${profile.name} ${profile.lastname}`.trim() : username ?? "Mi cuenta"}
                    </p>
                    <p className="truncate text-xs text-white/70">
                      @{profile?.username?.trim() || username || "tipster"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/80" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {profile ? `${profile.name} ${profile.lastname}`.trim() : username ?? "Mi cuenta"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      @{profile?.username?.trim() || username || "tipster"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem
                    onClick={openProfile}
                    className="rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <UserRound className="h-4 w-4" />
                    Mi perfil
                  </DropdownMenuItem>
                  {role === 'ROLE_TIPSTER' && (
                    <DropdownMenuItem
                      onClick={openSavedPosts}
                      className="rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <Bookmark className="h-4 w-4" />
                      Guardados
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
                <Link 
                  to="/login" 
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Iniciar Sesión
                </Link>
              <Link 
                to="/registro" 
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
              >
                Ser tipster
              </Link>
            </>
          )}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-primaryBlue/98 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2">
            {authenticated ? (
              <>
                <Link 
                  to={homePath}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                >
                  {role === 'ROLE_ADMIN' ? 'Panel' : 'Inicio'}
                </Link>
                {role === 'ROLE_TIPSTER' && (
                  <Link
                    to="/perfil"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    Mi perfil
                  </Link>
                )}
                {role === 'ROLE_TIPSTER' && (
                  <Link
                    to="/guardados"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    <Bookmark className="h-4 w-4" />
                    Guardados
                  </Link>
                )}
                {role === 'ROLE_ADMIN' && (
                  <Link
                    to="/admin/perfil"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    Mi perfil
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-1 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro"
                  onClick={closeMenu}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
                >
                  Ser tipster
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TipsterHeader;
