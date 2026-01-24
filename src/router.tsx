import Index from "./pages/Index";
import UserSelect from "./pages/UserSelect";
import Planet from "./pages/Planet";
import Game from "./pages/Game";
import Result from "./pages/Result";
import Achievements from "./pages/Achievements";
import Mistakes from "./pages/Mistakes";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import DataManagement from "./pages/DataManagement";
import NotFound from "./pages/NotFound";
import { AuthRoute, AdminRoute } from "./components/auth/ProtectedRoute";

export const routers = [
    {
      path: "/select-user",
      name: 'userSelect',
      element: <UserSelect />,
    },
    {
      path: "/",
      name: 'home',
      element: <AuthRoute><Index /></AuthRoute>,
    },
    {
      path: "/planet/:planetId",
      name: 'planet',
      element: <AuthRoute><Planet /></AuthRoute>,
    },
    {
      path: "/game/:planetId/:levelId",
      name: 'game',
      element: <AuthRoute><Game /></AuthRoute>,
    },
    {
      path: "/result",
      name: 'result',
      element: <AuthRoute><Result /></AuthRoute>,
    },
    {
      path: "/achievements",
      name: 'achievements',
      element: <AuthRoute><Achievements /></AuthRoute>,
    },
    {
      path: "/mistakes",
      name: 'mistakes',
      element: <AuthRoute><Mistakes /></AuthRoute>,
    },
    {
      path: "/leaderboard",
      name: 'leaderboard',
      element: <AuthRoute><Leaderboard /></AuthRoute>,
    },
    {
      path: "/knowledge-graph",
      name: 'knowledgeGraph',
      element: <AuthRoute><KnowledgeGraph /></AuthRoute>,
    },
    {
      path: "/data-management",
      name: 'dataManagement',
      element: <AdminRoute><DataManagement /></AdminRoute>,
    },
    {
      path: "/admin",
      name: 'admin',
      element: <AdminRoute><Admin /></AdminRoute>,
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
