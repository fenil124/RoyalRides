import {
  useLocation,
  useNavigate,
  useSearchParams as useRouterSearchParams,
  NavigateFunction,
} from 'react-router-dom';

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function useRouter() {
  const navigate: NavigateFunction = useNavigate();

  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {
      window.location.reload();
    },
    prefetch: () => {
      // No-op in client-side Vite/SPA
    },
  };
}

export function useSearchParams(): ReturnType<typeof useRouterSearchParams>[0] {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}

export function redirect(url: string) {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}
