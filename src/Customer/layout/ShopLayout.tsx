import { Outlet } from 'react-router-dom';
import ShopNavbar from './ShopNavbar';
import DepartmentMenu from './ShopNavbar';

export default function ShopLayout() {
  return (
    <div className="min-h-screen flex flex-col">
        <DepartmentMenu />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}