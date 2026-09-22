import { Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainLayout from './components/layout/mainLayout/MainLayout'
import AuthLayout from './components/layout/authLayout/AuthLayout'
import MatchList from './components/matches/matchList/MatchList'
import MatchDetails from './components/matches/matchDetails/MatchDetails'
import ClubList from './components/clubs/clubList/ClubList'
import CourtList from './components/courts/courtList/CourtList'
import MyTicketList from './components/tickets/myTicketList/MyTicketList'
import Login from './components/auth/login/Login'
import Protected from './components/auth/protected/Protected'
import PageNotFound from './components/pageNotFound/PageNotFound'
import { useAuth } from './context/useAuth'
import MatchAdmin from './components/matches/matchAdmin/MatchAdmin'

export default function App() {
  // La sesión se lee acá y baja por props a Protected, que se mantiene
  // como un componente puro sin dependencia del contexto.
  const { user } = useAuth()

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MatchList />} />
          <Route path="/partidos/:id" element={<MatchDetails />} />

          {/* Sólo un ADMIN entra acá. La sesión se lee de localStorage
              antes del primer render, así que un F5 no expulsa al login. */}
          <Route
            element={
              <Protected
                isSignedIn={user !== null}
                roles={['ADMIN']}
                userRole={user?.role}
              />
            }
          >
            {/* El /* delega el resto del camino al <Routes> interno de
                ClubList: así el estado y los handlers del CRUD viven a
                ese nivel y no hay que subirlos a App. */}
            <Route path="/clubes/*" element={<ClubList />} />
            <Route path="/canchas/*" element={<CourtList />} />
            <Route path="/admin/partidos/*" element={<MatchAdmin />} />
          </Route>
                    {/* Cualquier usuario logueado ve sus propias entradas: este
              Protected no pasa roles, así que sólo exige sesión. El
              backend igual devuelve únicamente las del token. */}
          <Route element={<Protected isSignedIn={user !== null} />}>
            <Route path="/mis-entradas/*" element={<MyTicketList />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* path="*" matchea cualquier URL que no haya matcheado antes.
            Va último porque React Router elige la ruta más específica. */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {/* Un solo ToastContainer para toda la app: successToast y
          errorToast (src/shared/notifications.ts) escriben acá. */}
      <ToastContainer />
    </>
  )
}