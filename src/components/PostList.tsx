import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Pagination,
  Button,
} from "@nextui-org/react";
import { Post } from "../services/apiService";
import { Calendar, Clock, Tag } from "lucide-react";
import DOMPurify from "dompurify";

interface PostListProps {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  pagination,
  loading,
  error,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const createExcerpt = (content: string) => {
    const preservedContent = content
      .replace(/\n/g, "<br/>")
      .replace(/ {2}/g, " &nbsp;");

    const sanitizedContent = DOMPurify.sanitize(preservedContent, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "span",
      ],
      ALLOWED_ATTR: [],
    });

    return sanitizedContent;
  };

  const [expandedPosts, setExpandedPosts] = React.useState<Set<string>>(
    new Set()
  );

  const toggleExpansion = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  const navToPostPage = (post: Post) => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div className="w-full space-y-6">
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="w-full animate-pulse">
              <CardBody>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts?.map((post) => (
              <Card
                key={post.id}
                className="w-full p-2"
                isPressable={true}
                onPress={() => navToPostPage(post)}
              >
                <CardHeader className="flex flex-col items-start gap-1">
                  <h2 className="text-xl font-bold text-left">{post.title}</h2>
                  <p className="text-small text-default-500">
                    Publicado por: {post.author?.name}
                  </p>
                </CardHeader>

                <CardBody>
                  <div
                    className={`prose max-w-none whitespace-pre-wrap ${
                      !expandedPosts.has(post.id) ? "line-clamp-6" : ""
                    }`}
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: createExcerpt(
                        expandedPosts.has(post.id)
                          ? post.content
                          : post.content.substring(0, 1000) +
                              (post.content.length > 1000 ? "..." : "")
                      ),
                    }}
                  />
                  {post.content.length > 1000 && (
                    <Button
                      size="sm"
                      variant="light"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpansion(post.id);
                      }}
                    >
                      {expandedPosts.has(post.id) ? "Ver menos" : "Ver más"}
                    </Button>
                  )}
                </CardBody>

                <CardFooter className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-small text-default-500">
                    <Calendar size={16} />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center gap-1 text-small text-default-500">
                    <Clock size={16} />
                    {post.readingTime} min read
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip className="bg-primary-100 text-primary">
                      {post.category.name}
                    </Chip>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        className="bg-default-100"
                        startContent={<Tag size={14} />}
                      >
                        {tag.name}
                      </Chip>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-6">
            <Pagination
              total={pagination.totalPages}
              initialPage={pagination.currentPage}
              onChange={(newPage) => onPageChange(newPage)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PostList;
