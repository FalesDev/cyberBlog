import React, { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react"; // Añadir Search
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Plus, Edit3, LogOut, BookDashed } from "lucide-react";
import AuthModal from "../components/AuthModal";

interface NavBarProps {
  isAuthenticated: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
  className?: string;
  toggleSidebar: () => void;
  searchQuery?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  isAuthenticated,
  userProfile,
  onLogout,
  toggleSidebar,
  searchQuery: externalSearchQuery = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(externalSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", path: "/" },
    { name: "Categorias", path: "/categories" },
    { name: "Etiquetas", path: "/tags" },
  ];

  useEffect(() => {
    // Sincronizar con URL externa
    const currentSearch =
      new URLSearchParams(location.search).get("search") || "";
    if (currentSearch !== localSearchQuery) {
      setLocalSearchQuery(currentSearch);
    }
  }, [location.search]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (localSearchQuery.trim()) {
        params.set("search", localSearchQuery.trim());
      } else {
        params.delete("search");
      }
      navigate({ search: params.toString() });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearchQuery, navigate, location.search]);

  // Sincronizar con query string externo
  useEffect(() => {
    setLocalSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  return (
    <Navbar
      isBordered
      className="fixed top-0 w-full z-50 h-16"
      isMenuOpen={isMenuOpen} // Añadir esta prop
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Botón para móvil */}
      <NavbarContent className="lg:hidden" justify="start">
        <Button
          isIconOnly
          variant="light"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </Button>
      </NavbarContent>

      {/* Logo a la izquierda */}
      <NavbarContent justify="start" className="flex-[0_0_auto] min-w-fit">
        <NavbarBrand className="gap-1">
          <Link to="/" className="font-black text-2xl flex items-center">
            <img src="/iconBlog.png" alt="Ícono" className="h-10 w-10 mr-1" />
            <span className="hidden lg:inline">Cyber Blog</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Buscador centrado */}
      <NavbarContent
        as="div"
        className="flex-grow-0 mx-2 w-[500px]"
        justify="center"
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar en Cyber Blog"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
          />
        </div>
      </NavbarContent>

      {/* Contenedor derecho */}
      <NavbarContent justify="end" className="flex-none gap-2">
        {isAuthenticated ? (
          <>
            <NavbarItem>
              <Button
                as={Link}
                to="/posts/drafts"
                color="secondary"
                variant="flat"
                startContent={<BookDashed size={16} />}
              >
                Borradores
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                variant="flat"
                startContent={<Plus size={16} />}
              >
                Crear
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    src={userProfile?.avatar}
                    name={userProfile?.name}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="drafts" startContent={<Edit3 size={16} />}>
                    <Link to="/posts/drafts">Mis borradores</Link>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    startContent={<LogOut size={16} />}
                    className="text-danger"
                    color="danger"
                    onPress={onLogout}
                  >
                    Cerrar sesión
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <AuthModal />
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              to={item.path}
              className={`w-full ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-default-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;
