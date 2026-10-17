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
import UserList from './components/users/userList/UserList'
import Register from './components/auth/register/Register'
import PaymentConfirming from './components/payments/paymentConfirming/PaymentConfirming'
import PaymentError from './components/payments/paymentError/PaymentError'
import MatchLogList from './components/matchLogs/matchLogList/MatchLogList'
import TicketValidation from './components/tickets/ticketValidation/TicketValidation'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MatchList />} />
          <Route path="/partidos/:id" element={<MatchDetails />} />

          <Route path="/pago/error" element={<PaymentError />} />

          <Route
            element={
              <Protected
                isSignedIn={user !== null}
                roles={['ADMIN']}
                userRole={user?.role}
              />
            }
          >
            <Route path="/clubes/*" element={<ClubList />} />
            <Route path="/canchas/*" element={<CourtList />} />
            <Route path="/admin/usuarios/*" element={<UserList />} />
            <Route path="/admin/partidos/*" element={<MatchAdmin />} />
            <Route path="/admin/historial" element={<MatchLogList />} />
          </Route>

          <Route
            element={
              <Protected
                isSignedIn={user !== null}
                roles={['OPERATOR', 'ADMIN']}
                userRole={user?.role}
              />
            }
          >
            <Route path="/validar-entradas" element={<TicketValidation />} />
          </Route>

          <Route element={<Protected isSignedIn={user !== null} />}>
            <Route path="/mis-entradas/*" element={<MyTicketList />} />
            <Route path="/pago/confirmando" element={<PaymentConfirming />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <ToastContainer />
    </>
  )
}