// components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Folder,
  Tag,
  FileEdit,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../components/AuthContext";
import { apiService, Category, Tag as TagType } from "../services/apiService";
import { useEffect, useState } from "react";
import { useData } from "../contexts/DataContext";

interface SidebarProps {
  isAuthenticated: boolean;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAuthenticated, isOpen }) => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.name === "ADMIN");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estados para categorías y etiquetas
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const { refreshCount } = useData();

  const [visibleCategories, setVisibleCategories] = useState(4);
  const [visibleTags, setVisibleTags] = useState(4);

  useEffect(() => {
    setVisibleCategories(4);
    setVisibleTags(4);
  }, [refreshCount]);

  const handleCategoryClick = (categoryId: string) => {
    const newParams = new URLSearchParams();
    newParams.set("category", categoryId);

    // Navegar a la ruta principal con los parámetros
    navigate(`/?${newParams.toString()}`);
    setSelectedOption(`category-${categoryId}`);
  };

  const handleTagClick = (tagId: string) => {
    const newParams = new URLSearchParams();
    newParams.set("tag", tagId);

    // Navegar a la ruta principal con los parámetros
    navigate(`/?${newParams.toString()}`);
    setSelectedOption(`tag-${tagId}`);
  };

  const handleNavClick = () => {
    setSelectedOption(null); // Limpiar selección de categorías y etiquetas
  };

  // Cargar categorías y etiquetas desde la API
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const fetchedCategories = await apiService.getCategories();
        const fetchedTags = await apiService.getTags();
        setCategories(fetchedCategories ?? []);
        setTags(fetchedTags ?? []);
      } catch (error) {
        console.error("Error loading categories and tags", error);
      }
    };

    fetchCategoriesAndTags();
  }, [refreshCount]);

  return (
    <>
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white dark:bg-gray-800 p-0 transition-all duration-300 z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <aside className="fixed left-0 top-0 h-[calc(100vh-4rem)] w-64 bg-background p-4 transition-all duration-300 z-40 flex flex-col">
          <nav className="flex-1 overflow-y-auto">
            <NavLink
              to="/"
              end
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive && !selectedOption
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`
              }
            >
              <BookOpen size={16} />
              Inicio
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/categories"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive && !selectedOption
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`
                }
              >
                <Folder size={16} />
                Categorías
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/tags"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive && !selectedOption
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`
                }
              >
                <Tag size={16} />
                Etiquetas
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/posts/drafts"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive && !selectedOption
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`
                }
              >
                <FileEdit size={16} />
                Borradores
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/users"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive && !selectedOption
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`
                }
              >
                <User size={16} />
                Usuarios
              </NavLink>
            )}

            {/* Sección Categorías */}
            <hr className="my-2 border-t border-gray-300 dark:border-gray-700" />
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Folder size={16} />
              Categorías
              {categoriesOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            {categoriesOpen && (
              <div className="pl-6 space-y-1">
                {categories.slice(0, visibleCategories).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`block w-full text-left px-3 py-1 rounded-lg transition-all ${
                      selectedOption === `category-${category.id}`
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {category.name} ({category.postCount})
                  </button>
                ))}
                {categories.length > visibleCategories && (
                  <button
                    onClick={() => setVisibleCategories((prev) => prev + 4)}
                    className="mt-2 rounded-full bg-blue-700 px-4 py-2 text-white transition-all hover:bg-blue-600"
                  >
                    Ver más
                  </button>
                )}
              </div>
            )}

            {/* Sección Etiquetas */}
            <hr className="my-2 border-t border-gray-300 dark:border-gray-700" />
            <button
              onClick={() => setTagsOpen(!tagsOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Tag size={16} />
              Etiquetas
              {tagsOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            {tagsOpen && (
              <div className="pl-6 space-y-1">
                {tags.slice(0, visibleTags).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`block w-full text-left px-3 py-1 rounded-lg transition-all ${
                      selectedOption === `tag-${tag.id}`
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {tag.name} ({tag.postCount})
                  </button>
                ))}
                {tags.length > visibleTags && (
                  <button
                    onClick={() => setVisibleTags((prev) => prev + 4)}
                    className="mt-2 rounded-full bg-blue-700 px-4 py-2 text-white transition-all hover:bg-blue-600"
                  >
                    Ver más
                  </button>
                )}
              </div>
            )}
          </nav>
        </aside>
      </aside>
    </>
  );
};

export default Sidebar;
