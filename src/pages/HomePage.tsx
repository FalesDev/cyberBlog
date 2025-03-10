import React, { useEffect, useState } from "react";
import { apiService, Post, PaginatedResponse } from "../services/apiService";
import PostList from "../components/PostList";
import { useSearchParams } from "react-router-dom";

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Estado unificado para los posts
  const [postsData, setPostsData] = useState<PaginatedResponse<Post> | null>(
    null
  );

  // Obtener parámetros de búsqueda
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || undefined;
  const selectedTag = searchParams.get("tag") || undefined;
  const sortBy = searchParams.get("sort") || "createdAt,desc";

  // Obtener posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response: PaginatedResponse<Post>;

        if (searchQuery) {
          response = await apiService.searchPostsByTitle(
            searchQuery,
            page, // Ya viene de la URL
            pageSize
          );
        } else {
          response = await apiService.getPosts({
            categoryId: selectedCategory,
            tagId: selectedTag,
            page, // Usar página de la URL
            size: pageSize,
            sort: sortBy,
          });
        }
        setPostsData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [searchQuery, selectedCategory, selectedTag, page, sortBy]);

  // Manejar cambios de página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params); // Actualizar URL directamente
  };

  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams(searchParams);
      if (params.get("page") !== "1") {
        params.set("page", "1");
        setSearchParams(params, { replace: true }); // Actualizar sin historial extra
      }
    }
  }, [searchQuery, searchParams, setSearchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <PostList
        posts={postsData?.content || []}
        pagination={{
          currentPage: page,
          totalPages: postsData?.totalPages || 0,
          totalElements: postsData?.totalElements || 0,
        }}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default HomePage;
