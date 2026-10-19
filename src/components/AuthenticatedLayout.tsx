import { Outlet } from 'react-router';
import { NavBar } from './NavBar';

export function AuthenticatedLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
