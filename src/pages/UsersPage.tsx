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
  Tooltip,
  Chip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { apiService, User, Role } from "../services/apiService";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        currentUser &&
        currentUser.roles.some((role) => role.name === "ADMIN")
      ) {
        try {
          const [usersResponse, rolesResponse] = await Promise.all([
            apiService.getUsers(),
            apiService.getRoles(),
          ]);
          setUsers(usersResponse ?? []);
          setRoles(rolesResponse ?? []);
          window.scrollTo(0, 0);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error al cargar datos");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response ?? []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        "No se pudieron cargar los usuarios. Inténtelo nuevamente más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim() || selectedRoles.length === 0) {
      setError("Se requieren nombre, correo electrónico y roles");
      return false;
    }
    if (!editingUser && !password.trim()) {
      setError("Se requiere contraseña para nuevos usuarios");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, {
          id: editingUser.id,
          name,
          email,
          password: password, // Ajustar según requerimientos del backend
          roleIds: selectedRoles,
        });
      } else {
        await apiService.createUser({
          name,
          email,
          password,
          roleIds: selectedRoles,
        });
      }
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(`Error ${editingUser ? "updating" : "creating"} user`);
      console.error("Submission error:", err);
    }
  };

  const handleDelete = async (userToDelete: User) => {
    if (userToDelete.id === currentUser?.id) {
      setError("No puedes borrarte a ti mismo");
      return;
    }

    if (
      window.confirm(
        `¿Estas seguro de eliminar al usuario ${userToDelete.email}?`
      )
    ) {
      try {
        await apiService.deleteUser(userToDelete.id);
        await fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Error al eliminar usuario");
      }
    }
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setSelectedRoles(user.roles.map((role) => role.id));
    onOpen();
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-auto">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onClick={handleOpenCreateModal}
          >
            Agregar usuario
          </Button>
        </CardHeader>

        <CardBody>
          {loading && (
            <div className="text-center py-8">
              <p>Cargando usuarios...</p>
            </div>
          )}
          {!loading && error && (
            <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>NOMBRE</TableColumn>
              <TableColumn>CORREO ELECTRONICO</TableColumn>
              <TableColumn>ROLES</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((role) => (
                      <Chip
                        key={role.id}
                        className={`mr-2 ${
                          role.name === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {role.name}
                      </Chip>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={() => handleOpenEditModal(user)}
                        isDisabled={
                          user.id === currentUser?.id ||
                          user.name === "Admin User"
                        }
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Tooltip
                        content={
                          user.id === currentUser?.id
                            ? "Cannot delete yourself"
                            : "Eliminar usuario"
                        }
                      >
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onClick={() => handleDelete(user)}
                          isDisabled={
                            user.id === currentUser?.id ||
                            user.name === "Admin User"
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>
            {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
          </ModalHeader>
          <ModalBody>
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired={!editingUser}
              placeholder={editingUser ? "" : ""}
            />
            <Select
              label="Agregar roles"
              selectedKeys={new Set(selectedRoles)}
              scrollShadowProps={{ isEnabled: false }}
              classNames={{ popoverContent: "max-h-[300px] overflow-y-auto" }}
              isRequired
            >
              {roles.map((role) => (
                <SelectItem
                  key={role.id}
                  value={role.id}
                  onClick={() => {
                    if (!selectedRoles.includes(role.id)) {
                      setSelectedRoles([...selectedRoles, role.id]);
                    }
                  }}
                >
                  {role.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRoles.map((roleId) => {
                const role = roles.find((r) => r.id === roleId);
                return (
                  <Chip
                    key={roleId}
                    onClose={() =>
                      setSelectedRoles(
                        selectedRoles.filter((id) => id !== roleId)
                      )
                    }
                    variant="flat"
                    endContent={<X size={14} />}
                  >
                    {role?.name || "Rol desconocido"}
                  </Chip>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              {editingUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UsersPage;
