import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService, Post, PaginatedResponse } from "../services/apiService";
import PostList from "../components/PostList";

const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<PaginatedResponse<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Puedes hacerlo configurable

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDrafts({
          page,
          size: pageSize,
        });
        setDrafts(response);
        setError(null);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load drafts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-auto">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Drafts</h1>
          <Button
            as={Link}
            to="/posts/new"
            color="primary"
            startContent={<Plus size={16} />}
          >
            New Post
          </Button>
        </CardHeader>

        <CardBody>
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          <PostList
            posts={drafts?.content || []}
            pagination={{
              currentPage: page,
              totalPages: drafts?.totalPages || 0,
              totalElements: drafts?.totalElements || 0,
            }}
            loading={loading}
            error={error}
            onPageChange={setPage}
          />

          {drafts?.content?.length === 0 && !loading && (
            <div className="text-center py-8 text-default-500">
              <p>You don't have any draft posts yet.</p>
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                variant="flat"
                className="mt-4"
              >
                Create Your First Post
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DraftsPage;
