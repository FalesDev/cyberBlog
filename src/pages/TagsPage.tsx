import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { Plus, Trash2, X } from "lucide-react";
import { apiService, Tag } from "../services/apiService";
import { useData } from "../contexts/DataContext";

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { refreshData } = useData();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTags();
      setTags(response);
      setError(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudieron cargar las etiquetas. Inténtalo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddTags = async () => {
    if (newTags.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.createTags(newTags);
      await fetchTags();
      refreshData();
      handleModalClose();
    } catch (err) {
      console.error(err);
      setError("No se pudieron crear las etiquetas. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar la etiqueta "${tag.name}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteTag(tag.id);
      await fetchTags();
      refreshData();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la etiqueta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setNewTags([]);
    setTagInput("");
    onClose();
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim().toLowerCase();
      if (value && !newTags.includes(value)) {
        setNewTags([...newTags, value]);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput && newTags.length > 0) {
      setNewTags(newTags.slice(0, -1));
    }
  };

  const handleRemoveNewTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="max-w-7xl mx-auto px-auto">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Etiquetas</h1>

          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onClick={onOpen}
          >
            Agregar etiquetas
          </Button>
        </CardHeader>

        <CardBody>
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Table
            aria-label="Tags table"
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[500px]",
            }}
          >
            <TableHeader>
              <TableColumn>NOMBRE</TableColumn>
              <TableColumn>TOTAL DE PUBLICACIONES</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<div>Cargando etiquetas...</div>}
            >
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.postCount || 0}</TableCell>
                  <TableCell>
                    <Tooltip
                      content={
                        tag.postCount
                          ? "Cannot delete tag with existing posts"
                          : "Delete tag"
                      }
                    >
                      <Button
                        isIconOnly
                        variant="flat"
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(tag)}
                        isDisabled={tag?.postCount ? tag.postCount > 0 : false}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalContent>
          <ModalHeader>Agregar etiquetas</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Ingrese las etiquetas"
                placeholder="Escriba y presione Enter o coma para agregar etiquetas"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
              <div className="flex flex-wrap gap-2">
                {newTags.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => handleRemoveNewTag(tag)}
                    variant="flat"
                    endContent={<X size={14} />}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={handleModalClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleAddTags}
              isLoading={isSubmitting}
              isDisabled={newTags.length === 0}
            >
              Agregar etiquetas
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TagsPage;
